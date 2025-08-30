const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const xss = require('xss');
const crypto = require('crypto');

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
};

// Security validation middleware
const validateSecurity = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /eval\s*\(/i, // Code injection
    /javascript:/i // JavaScript protocol
  ];
  
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
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'CSRF token validation failed'
    });
  }
  
  next();
};

// Generate CSRF token
const generateCSRFToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Contact form validation
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
    .escape(),
];

// Authentication validation
const validateAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }
  next();
};

// Admin validation
const validateAdmin = (req, res, next) => {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(403).json({
      error: 'Admin access required'
    });
  }
  next();
};

module.exports = {
  sanitizeInput,
  validateSecurity,
  csrfProtection,
  generateCSRFToken,
  contactValidation,
  validateAuth,
  validateAdmin
};
