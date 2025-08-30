const winston = require('winston');

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request start
  winston.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    winston.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

// Security event logger
const securityLogger = (event, details) => {
  winston.warn('Security event detected', {
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

// Performance logger
const performanceLogger = (operation, duration, details = {}) => {
  winston.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  requestLogger,
  securityLogger,
  performanceLogger
};
