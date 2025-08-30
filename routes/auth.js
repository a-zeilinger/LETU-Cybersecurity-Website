const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { sanitizeInput, generateCSRFToken } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const router = express.Router();

// Generate CSRF token for all routes
router.use(generateCSRFToken);

// User registration validation
const registrationValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

// User login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// User registration
router.post('/register', sanitizeInput, registrationValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists (in production, check database)
    // For demo purposes, we'll simulate this check
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user (in production, save to database)
    const user = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      role: 'member',
      isActive: true
    };
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    // Set session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration.',
      timestamp: new Date().toISOString()
    });
  }
}));

// User login
router.post('/login', sanitizeInput, loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { email, password } = req.body;
    
    // In production, fetch user from database
    // For demo purposes, we'll simulate user authentication
    const mockUser = {
      id: 1,
      username: 'demo_user',
      email: 'demo@cybr.club',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5KQqK8i', // "SecurePass123!"
      role: 'member',
      isActive: true
    };
    
    // Check if user exists and password matches
    if (email !== mockUser.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const passwordMatch = await bcrypt.compare(password, mockUser.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    // Set session
    req.session.userId = mockUser.id;
    req.session.userRole = mockUser.role;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      },
      token,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
      timestamp: new Date().toISOString()
    });
  }
}));

// User logout
router.post('/logout', asyncHandler(async (req, res) => {
  try {
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error during logout'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout.',
      timestamp: new Date().toISOString()
    });
  }
}));

// Get current user
router.get('/me', asyncHandler(async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // In production, fetch user from database
    const user = {
      id: req.session.userId,
      username: 'demo_user',
      email: 'demo@cybr.club',
      role: req.session.userRole,
      isActive: true
    };
    
    res.status(200).json({
      success: true,
      user,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user data.',
      timestamp: new Date().toISOString()
    });
  }
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Generate new token
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      success: true,
      token: newToken,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    });
  }
}));

module.exports = router;
