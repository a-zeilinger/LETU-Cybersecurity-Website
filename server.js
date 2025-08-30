const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const xss = require('xss');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files
app.use(express.static('public'));

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

// Routes
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

// API Routes
app.get('/api/events', (req, res) => {
  const events = [
    {
      id: 1,
      title: "Cybersecurity Workshop: Password Security",
      date: "2024-02-15",
      time: "18:00",
      location: "Computer Science Building, Room 101",
      description: "Learn about password security best practices, password managers, and how to create strong, unique passwords.",
      image: "/images/event-password.jpg"
    },
    {
      id: 2,
      title: "CTF Competition: Capture The Flag",
      date: "2024-02-28",
      time: "19:00",
      location: "Engineering Center, Lab 3",
      description: "Join our monthly CTF competition! Test your hacking skills in a safe, controlled environment.",
      image: "/images/event-ctf.jpg"
    },
    {
      id: 3,
      title: "Guest Speaker: Career in Cybersecurity",
      date: "2024-03-10",
      time: "17:30",
      location: "Business School Auditorium",
      description: "Industry professional shares insights about cybersecurity careers and industry trends.",
      image: "/images/event-career.jpg"
    }
  ];
  
  res.json(events);
});

app.get('/api/blog', (req, res) => {
  const blogPosts = [
    {
      id: 1,
      title: "The Rise of Ransomware: What You Need to Know",
      excerpt: "Ransomware attacks have increased by 150% in the last year. Learn how to protect yourself and your organization.",
      content: "Ransomware has become one of the most significant cybersecurity threats facing individuals and organizations today. These malicious programs encrypt your files and demand payment for the decryption key. In this comprehensive guide, we'll explore the current state of ransomware attacks, common attack vectors, and effective prevention strategies...",
      author: "Dr. Sarah Chen",
      date: "2024-01-15",
      readTime: "5 min read",
      image: "/images/blog-ransomware.jpg"
    },
    {
      id: 2,
      title: "Zero-Day Vulnerabilities: Understanding the Threat",
      excerpt: "Zero-day vulnerabilities represent the most dangerous type of security flaw. Here's what you need to understand.",
      content: "A zero-day vulnerability is a software security flaw that is unknown to the vendor and has no available patch. These vulnerabilities are highly prized by attackers because they can be exploited before defenders have a chance to respond. This article explores the nature of zero-day vulnerabilities, how they're discovered and exploited, and what organizations can do to mitigate the risk...",
      author: "Prof. Michael Rodriguez",
      date: "2024-01-10",
      readTime: "7 min read",
      image: "/images/blog-zero-day.jpg"
    },
    {
      id: 3,
      title: "Social Engineering: The Human Factor in Cybersecurity",
      excerpt: "The weakest link in any security system is often human psychology. Learn about social engineering tactics.",
      content: "Social engineering attacks exploit human psychology rather than technical vulnerabilities. These attacks can be devastating because they bypass even the most sophisticated technical defenses. In this article, we'll examine common social engineering techniques, real-world examples, and strategies for building a security-aware culture...",
      author: "Lisa Thompson",
      date: "2024-01-05",
      readTime: "6 min read",
      image: "/images/blog-social-engineering.jpg"
    }
  ];
  
  res.json(blogPosts);
});

// Contact form endpoint
app.post('/api/contact', sanitizeInput, contactValidation, (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, email, message } = req.body;
    
    // Log the contact form submission (in production, you'd send an email)
    console.log('Contact form submission:', {
      name: name,
      email: email,
      message: message,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    // In a real application, you would send an email here
    // For now, we'll just return a success response
    
    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request.'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`Cybersecurity Club website running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
