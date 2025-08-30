const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const Redis = require('ioredis');
const winston = require('winston');
const expressWinston = require('express-winston');
const cron = require('node-cron');
require('dotenv').config();

// Import security configuration
const { createSecurityMiddleware } = require('./config/security');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const securityRoutes = require('./routes/security');
const adminRoutes = require('./routes/admin');

// Import middleware
const { validateSecurity } = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

// Import services
const SecurityMonitor = require('./services/SecurityMonitor');
const CTFService = require('./services/CTFService');
const NotificationService = require('./services/NotificationService');

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['https://cybr.club', 'https://www.cybr.club'],
    credentials: true
  }
});

// Initialize Redis for caching and sessions
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize security middleware
const security = createSecurityMiddleware();

// Initialize services
const securityMonitor = new SecurityMonitor();
const ctfService = new CTFService();
const notificationService = new NotificationService(io);

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Security middleware
app.use(security.helmet);
app.use(security.cors);
app.use(security.rateLimit);
app.use(security.securityHeaders);
app.use(validateSecurity);

// Additional middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Session configuration
app.use(session({
  ...security.session,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersecurity_club',
    ttl: 24 * 60 * 60 // 1 day
  })
}));

// Request logging middleware
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false
}));

// Serve static files with security headers
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersecurity_club', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch((err) => {
  logger.error('MongoDB connection error:', err);
});

// Redis connection
redis.on('connect', () => {
  logger.info('Connected to Redis');
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Join user to appropriate rooms based on their role
  socket.on('join-room', (room) => {
    socket.join(room);
    logger.info(`User ${socket.id} joined room: ${room}`);
  });
  
  // Handle CTF challenge submissions
  socket.on('submit-flag', async (data) => {
    try {
      const result = await ctfService.validateFlag(data.challengeId, data.flag, socket.id);
      socket.emit('flag-result', result);
      
      if (result.correct) {
        // Broadcast to all users in the CTF room
        io.to('ctf-room').emit('flag-captured', {
          challengeId: data.challengeId,
          userId: socket.id,
          timestamp: new Date()
        });
      }
    } catch (error) {
      logger.error('Flag validation error:', error);
      socket.emit('flag-result', { error: 'Validation failed' });
    }
  });
  
  // Handle real-time chat
  socket.on('chat-message', (data) => {
    const sanitizedMessage = securityMonitor.sanitizeInput(data.message);
    io.to(data.room).emit('chat-message', {
      userId: socket.id,
      message: sanitizedMessage,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/admin', adminRoutes);

// Main page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/leadership', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leadership.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/ctf', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ctf.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Security monitoring endpoint
app.post('/api/security/csp-report', (req, res) => {
  logger.warn('CSP Violation:', req.body);
  securityMonitor.recordViolation(req.body);
  res.status(200).send('OK');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '2.0.0',
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redis.status === 'ready' ? 'connected' : 'disconnected'
    }
  };
  
  res.json(health);
});

// Scheduled security tasks
cron.schedule('0 */6 * * *', async () => {
  // Run security scan every 6 hours
  try {
    await securityMonitor.runSecurityScan();
    logger.info('Scheduled security scan completed');
  } catch (error) {
    logger.error('Scheduled security scan failed:', error);
  }
});

cron.schedule('0 2 * * *', async () => {
  // Clean up old logs and sessions daily at 2 AM
  try {
    await securityMonitor.cleanupOldData();
    logger.info('Daily cleanup completed');
  } catch (error) {
    logger.error('Daily cleanup failed:', error);
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Close database connections
  await mongoose.connection.close();
  await redis.quit();
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Close database connections
  await mongoose.connection.close();
  await redis.quit();
  
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {
  logger.info(`🚀 Cybersecurity Club Website running on ${HOST}:${PORT}`);
  logger.info(`🔒 Security features: HTTPS enforcement, CSP, XSS protection, rate limiting enabled`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 Monitoring: Security logging, real-time alerts, automated scans enabled`);
});

module.exports = { app, server, io };
