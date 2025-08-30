# LETU Cybersecurity Club Website

A modern, secure, and dynamic website for the LETU Cybersecurity Club, featuring advanced security measures, real-time CTF challenges, and comprehensive cybersecurity resources.

## 🚀 Features

### Core Functionality
- **Modern UI/UX**: Responsive design with cybersecurity aesthetics
- **Real-time CTF Platform**: Interactive Capture The Flag challenges
- **Event Management**: Dynamic event scheduling and registration
- **Blog System**: Security-focused content management
- **User Authentication**: Secure login/registration with JWT
- **Admin Dashboard**: Comprehensive administrative tools

### Security Features
- **Advanced Security Headers**: CSP, HSTS, XSS Protection
- **Rate Limiting**: DDoS protection and abuse prevention
- **Input Sanitization**: XSS and injection attack prevention
- **CSRF Protection**: Cross-site request forgery prevention
- **Session Security**: Secure session management
- **Real-time Monitoring**: Security event logging and alerts
- **Automated Scans**: Scheduled security assessments

### Technical Features
- **Real-time Communication**: Socket.IO for live updates
- **Database Integration**: MongoDB with Mongoose ODM
- **Caching**: Redis for performance optimization
- **Logging**: Comprehensive Winston logging system
- **API Security**: RESTful API with validation
- **Performance**: Compression and optimization

## 🛡️ Security Architecture

### Security Middleware
- **Helmet.js**: Security headers and CSP
- **Rate Limiting**: Request throttling and abuse prevention
- **CORS**: Cross-origin resource sharing control
- **Input Validation**: Request sanitization and validation
- **Session Security**: Secure cookie configuration

### Monitoring & Alerting
- **Security Events**: Real-time security monitoring
- **Threat Detection**: Pattern-based threat identification
- **Incident Response**: Automated security incident handling
- **Audit Logging**: Comprehensive security audit trails

## 🏗️ Architecture

```
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic services
├── public/          # Static assets
│   ├── css/         # Stylesheets
│   ├── js/          # Client-side JavaScript
│   └── images/      # Images and media
└── logs/            # Application logs
```

### Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript
- **Security**: Helmet, JWT, bcrypt
- **Monitoring**: Winston, Morgan

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 5.0 or higher
- Redis 6.0 or higher
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/letu-cybersecurity-website.git
   cd letu-cybersecurity-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB
   mongod
   
   # Start Redis
   redis-server
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Security Configuration
SESSION_SECRET=your-super-secret-session-key
JWT_SECRET=your-jwt-secret-key
BCRYPT_ROUNDS=12

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cybersecurity_club

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security Headers
CORS_ORIGIN=https://cybr.club,https://www.cybr.club
HSTS_MAX_AGE=31536000
```

### Security Configuration

The website includes comprehensive security configurations:

- **Content Security Policy (CSP)**: Restricts resource loading
- **HTTP Strict Transport Security (HSTS)**: Enforces HTTPS
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer Policy**: Controls referrer information

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure stateless authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Session Management**: Secure session handling
- **Role-based Access**: Admin and user permissions

### Input Validation & Sanitization
- **Request Validation**: Express-validator integration
- **XSS Prevention**: Input sanitization and encoding
- **SQL Injection Protection**: Parameterized queries
- **File Upload Security**: Type and size validation

### Monitoring & Logging
- **Security Events**: Real-time security monitoring
- **Audit Logging**: Comprehensive activity tracking
- **Threat Detection**: Pattern-based threat identification
- **Performance Monitoring**: Response time and resource usage

## 📱 Frontend Features

### Modern UI Components
- **Responsive Design**: Mobile-first approach
- **Interactive Elements**: Hover effects and animations
- **Loading States**: Smooth loading experiences
- **Error Handling**: User-friendly error messages

### CTF Platform
- **Challenge Management**: Dynamic challenge creation
- **Real-time Updates**: Live leaderboard and notifications
- **Progress Tracking**: User achievement monitoring
- **Hint System**: Progressive challenge assistance

### Event Management
- **Calendar Integration**: Event scheduling and display
- **Registration System**: User event signup
- **Notifications**: Event reminders and updates
- **Social Features**: Event sharing and discussion

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Environment Variables**
   - Set all required environment variables in Vercel dashboard
   - Ensure MongoDB and Redis connections are accessible

### Production Considerations

- **HTTPS**: Enable SSL/TLS encryption
- **CDN**: Use content delivery network for static assets
- **Monitoring**: Implement application performance monitoring
- **Backup**: Regular database and file backups
- **Updates**: Keep dependencies updated for security

## 🧪 Testing

### Security Testing
```bash
# Run security audit
npm run security-audit

# Run linting
npm run lint

# Run tests
npm test
```

### Manual Testing
- **Authentication**: Test login/logout flows
- **Authorization**: Verify role-based access
- **Input Validation**: Test malicious input handling
- **Security Headers**: Verify security header presence

## 📊 Performance

### Optimization Features
- **Compression**: Gzip compression for responses
- **Caching**: Redis-based caching system
- **CDN Integration**: Static asset optimization
- **Lazy Loading**: Progressive content loading

### Monitoring
- **Response Times**: API endpoint performance
- **Resource Usage**: Memory and CPU monitoring
- **Error Rates**: Application error tracking
- **User Experience**: Page load time optimization

## 🔧 Development

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run security audit
npm run security-audit

# Run linting
npm run lint

# Run tests
npm test
```

### Code Quality
- **ESLint**: JavaScript code linting
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation
- **Code Review**: Pull request requirements

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### CTF Endpoints
- `GET /api/ctf/challenges` - Get CTF challenges
- `POST /api/ctf/submit` - Submit flag
- `GET /api/ctf/leaderboard` - Get leaderboard
- `GET /api/ctf/progress` - Get user progress

### Event Endpoints
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Security Endpoints
- `GET /api/security/status` - Security status
- `POST /api/security/scan` - Run security scan
- `GET /api/security/threats` - Get threats
- `GET /api/security/metrics` - Security metrics

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Use meaningful commit messages
- Add JSDoc comments for functions
- Include error handling
- Write unit tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Use GitHub discussions for questions
- **Security**: Report security issues privately

### Contact Information
- **Email**: cyber@letu.edu
- **Website**: https://cybr.club
- **Discord**: Join our community server

## 🔮 Roadmap

### Upcoming Features
- **Mobile App**: Native mobile application
- **AI Integration**: Machine learning for threat detection
- **Advanced CTF**: More complex challenge types
- **Certification**: Industry certification preparation
- **Internship Portal**: Job and internship opportunities

### Long-term Goals
- **Global Expansion**: International cybersecurity partnerships
- **Research Platform**: Academic research collaboration
- **Industry Integration**: Direct industry partnerships
- **Open Source**: Contribute to security tools

---

**Built with ❤️ by the LETU Cybersecurity Club**

*Empowering the next generation of cybersecurity professionals*
