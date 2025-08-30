const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const crypto = require('crypto');

// Generate CSP nonce for inline scripts
const generateNonce = () => crypto.randomBytes(16).toString('base64');

// Security configuration object
const securityConfig = {
  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrc: [
        "'self'",
        "'nonce-${nonce}",
        "https://cdnjs.cloudflare.com",
        "https://www.googletagmanager.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://images.unsplash.com",
        "https://via.placeholder.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.cybr.club",
        "wss://cybr.club"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    },
    reportOnly: false,
    reportUri: '/api/security/csp-report'
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['https://cybr.club', 'https://www.cybr.club'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'X-CSRF-Token'
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 hours
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 / 60)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      // Use X-Forwarded-For header if behind proxy, otherwise use IP
      return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    }
  },

  // Additional rate limiters for specific endpoints
  strictRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
      error: 'Too many attempts. Please wait before trying again.',
      retryAfter: 15
    }
  },

  // Security headers configuration
  helmet: {
    contentSecurityPolicy: false, // We'll configure this separately
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: parseInt(process.env.HSTS_MAX_AGE) || 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  },

  // Session security
  session: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    name: 'cybr.sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.NODE_ENV === 'production' ? '.cybr.club' : undefined
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
    expiresIn: '24h',
    issuer: 'cybr.club',
    audience: 'cybr.club-users'
  },

  // Password security
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },

  // File upload security
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
    scanForMalware: true,
    virusTotalApiKey: process.env.VIRUS_TOTAL_API_KEY
  },

  // Security monitoring
  monitoring: {
    enableSecurityLogging: true,
    logFailedAttempts: true,
    alertOnSuspiciousActivity: true,
    suspiciousPatterns: [
      /\.\.\//, // Directory traversal
      /<script/i, // XSS attempts
      /union\s+select/i, // SQL injection
      /eval\s*\(/i, // Code injection
      /javascript:/i // JavaScript protocol
    ]
  }
};

// Security middleware factory
const createSecurityMiddleware = () => {
  const nonce = generateNonce();
  
  return {
    // Helmet middleware with custom CSP
    helmet: helmet({
      ...securityConfig.helmet,
      contentSecurityPolicy: {
        ...securityConfig.csp,
        directives: {
          ...securityConfig.csp.directives,
          scriptSrc: securityConfig.csp.directives.scriptSrc.map(src => 
            src === "'nonce-${nonce}" ? `'nonce-${nonce}'` : src
          )
        }
      }
    }),

    // CORS middleware
    cors: cors(securityConfig.cors),

    // Rate limiting middleware
    rateLimit: rateLimit(securityConfig.rateLimit),

    // Strict rate limiting for sensitive endpoints
    strictRateLimit: rateLimit(securityConfig.strictRateLimit),

    // Nonce getter for templates
    getNonce: () => nonce,

    // Security validation middleware
    validateSecurity: (req, res, next) => {
      // Check for suspicious patterns
      const userAgent = req.headers['user-agent'] || '';
      const suspiciousPatterns = securityConfig.monitoring.suspiciousPatterns;
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(userAgent) || pattern.test(req.url) || pattern.test(JSON.stringify(req.body))) {
          console.warn(`Suspicious activity detected from IP: ${req.ip}`);
          return res.status(403).json({
            error: 'Access denied',
            reason: 'Suspicious activity detected'
          });
        }
      }
      
      next();
    },

    // Security headers middleware
    securityHeaders: (req, res, next) => {
      // Additional security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      // Add nonce to response for CSP
      res.locals.nonce = nonce;
      
      next();
    }
  };
};

module.exports = {
  securityConfig,
  createSecurityMiddleware
};
