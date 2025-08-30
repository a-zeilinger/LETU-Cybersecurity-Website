const express = require('express');
const { body, validationResult } = require('express-validator');
const { sanitizeInput, contactValidation, generateCSRFToken } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const router = express.Router();

// Generate CSRF token for all routes
router.use(generateCSRFToken);

// Events API
router.get('/events', asyncHandler(async (req, res) => {
  const events = [
    {
      id: 1,
      title: "Cybersecurity Workshop: Password Security",
      date: "2024-02-15",
      time: "18:00",
      location: "Computer Science Building, Room 101",
      description: "Learn about password security best practices, password managers, and how to create strong, unique passwords.",
      image: "/images/event-password.jpg",
      category: "workshop",
      difficulty: "beginner",
      maxParticipants: 30,
      currentParticipants: 25
    },
    {
      id: 2,
      title: "CTF Competition: Capture The Flag",
      date: "2024-02-28",
      time: "19:00",
      location: "Engineering Center, Lab 3",
      description: "Join our monthly CTF competition! Test your hacking skills in a safe, controlled environment.",
      image: "/images/event-ctf.jpg",
      category: "competition",
      difficulty: "intermediate",
      maxParticipants: 50,
      currentParticipants: 42
    },
    {
      id: 3,
      title: "Guest Speaker: Career in Cybersecurity",
      date: "2024-03-10",
      time: "17:30",
      location: "Business School Auditorium",
      description: "Industry professional shares insights about cybersecurity careers and industry trends.",
      image: "/images/event-career.jpg",
      category: "lecture",
      difficulty: "all-levels",
      maxParticipants: 100,
      currentParticipants: 78
    },
    {
      id: 4,
      title: "Network Security Lab",
      date: "2024-03-15",
      time: "14:00",
      location: "Cybersecurity Lab, Building A",
      description: "Hands-on lab session covering network security fundamentals, packet analysis, and intrusion detection.",
      image: "/images/event-network.jpg",
      category: "lab",
      difficulty: "intermediate",
      maxParticipants: 20,
      currentParticipants: 15
    }
  ];
  
  res.json({
    success: true,
    data: events,
    total: events.length,
    timestamp: new Date().toISOString()
  });
}));

// Blog API
router.get('/blog', asyncHandler(async (req, res) => {
  const blogPosts = [
    {
      id: 1,
      title: "The Rise of Ransomware: What You Need to Know",
      excerpt: "Ransomware attacks have increased by 150% in the last year. Learn how to protect yourself and your organization.",
      content: "Ransomware has become one of the most significant cybersecurity threats facing individuals and organizations today. These malicious programs encrypt your files and demand payment for the decryption key. In this comprehensive guide, we'll explore the current state of ransomware attacks, common attack vectors, and effective prevention strategies...",
      author: "Dr. Sarah Chen",
      date: "2024-01-15",
      readTime: "5 min read",
      image: "/images/blog-ransomware.jpg",
      tags: ["ransomware", "malware", "security"],
      views: 1247,
      likes: 89
    },
    {
      id: 2,
      title: "Zero-Day Vulnerabilities: Understanding the Threat",
      excerpt: "Zero-day vulnerabilities represent the most dangerous type of security flaw. Here's what you need to understand.",
      content: "A zero-day vulnerability is a software security flaw that is unknown to the vendor and has no available patch. These vulnerabilities are highly prized by attackers because they can be exploited before defenders have a chance to respond. This article explores the nature of zero-day vulnerabilities, how they're discovered and exploited, and what organizations can do to mitigate the risk...",
      author: "Prof. Michael Rodriguez",
      date: "2024-01-10",
      readTime: "7 min read",
      image: "/images/blog-zero-day.jpg",
      tags: ["zero-day", "vulnerabilities", "threats"],
      views: 892,
      likes: 67
    },
    {
      id: 3,
      title: "Social Engineering: The Human Factor in Cybersecurity",
      excerpt: "The weakest link in any security system is often human psychology. Learn about social engineering tactics.",
      content: "Social engineering attacks exploit human psychology rather than technical vulnerabilities. These attacks can be devastating because they bypass even the most sophisticated technical defenses. In this article, we'll examine common social engineering techniques, real-world examples, and strategies for building a security-aware culture...",
      author: "Lisa Thompson",
      date: "2024-01-05",
      readTime: "6 min read",
      image: "/images/blog-social-engineering.jpg",
      tags: ["social-engineering", "psychology", "awareness"],
      views: 1103,
      likes: 94
    }
  ];
  
  res.json({
    success: true,
    data: blogPosts,
    total: blogPosts.length,
    timestamp: new Date().toISOString()
  });
}));

// Contact form endpoint
router.post('/contact', sanitizeInput, contactValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, email, message } = req.body;
    
    // Log the contact form submission
    console.log('Contact form submission:', {
      name: name,
      email: email,
      message: message,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    // In production, you would send an email here
    // For now, we'll just return a success response
    
    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request.',
      timestamp: new Date().toISOString()
    });
  }
}));

// CTF Challenges API
router.get('/ctf/challenges', asyncHandler(async (req, res) => {
  const challenges = [
    {
      id: 1,
      title: "Simple XOR",
      description: "Decrypt the message using XOR with key 'SECRET'",
      category: "cryptography",
      difficulty: "easy",
      points: 100,
      solvedBy: 45,
      flag: "FLAG{x0r_1s_fun}",
      hints: ["XOR is reversible", "Try different keys"]
    },
    {
      id: 2,
      title: "SQL Injection",
      description: "Find the admin password in the database",
      category: "web",
      difficulty: "medium",
      points: 200,
      solvedBy: 23,
      flag: "FLAG{sql_m4st3r}",
      hints: ["Try UNION SELECT", "Check the users table"]
    },
    {
      id: 3,
      title: "Buffer Overflow",
      description: "Exploit the buffer overflow to get a shell",
      category: "pwn",
      difficulty: "hard",
      points: 300,
      solvedBy: 12,
      flag: "FLAG{b0f_3xp3rt}",
      hints: ["Check the stack layout", "Find the return address"]
    }
  ];
  
  res.json({
    success: true,
    data: challenges,
    total: challenges.length,
    timestamp: new Date().toISOString()
  });
}));

// Leaderboard API
router.get('/ctf/leaderboard', asyncHandler(async (req, res) => {
  const leaderboard = [
    {
      rank: 1,
      username: "h4ck3r_m4st3r",
      points: 1250,
      challengesSolved: 8,
      lastSubmission: "2024-01-15T14:30:00Z"
    },
    {
      rank: 2,
      username: "cyber_ninja",
      points: 1100,
      challengesSolved: 7,
      lastSubmission: "2024-01-15T13:45:00Z"
    },
    {
      rank: 3,
      username: "security_guru",
      points: 950,
      challengesSolved: 6,
      lastSubmission: "2024-01-15T12:20:00Z"
    }
  ];
  
  res.json({
    success: true,
    data: leaderboard,
    total: leaderboard.length,
    timestamp: new Date().toISOString()
  });
}));

// Statistics API
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = {
    totalMembers: 156,
    activeMembers: 89,
    eventsThisMonth: 4,
    challengesSolved: 234,
    blogPosts: 12,
    securityIncidents: 0,
    uptime: "99.9%",
    lastUpdated: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;
