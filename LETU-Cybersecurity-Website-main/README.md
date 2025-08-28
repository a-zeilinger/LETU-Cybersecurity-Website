# Cybersecurity Club Website

A modern, secure website for a cybersecurity club built with Node.js, HTML, CSS, and JavaScript. Features a dark theme, responsive design, and comprehensive security measures.

## 🚀 Features

### Core Features
- **Home Page** - Welcome message with call-to-action and feature highlights
- **Events Page** - Dynamic event listings with API integration
- **Leadership Page** - Team member profiles and expertise areas
- **Blog Page** - Cybersecurity articles and insights
- **Contact Form** - Secure form handling with validation

### Security Features
- **Input Sanitization** - XSS protection and HTML sanitization
- **Rate Limiting** - API endpoint protection
- **CORS Configuration** - Cross-origin request security
- **Security Headers** - Comprehensive HTTP security headers
- **Form Validation** - Client and server-side validation
- **Honeypot Protection** - Bot protection for contact forms

### Design Features
- **Dark Theme** - Professional cybersecurity aesthetic
- **Responsive Design** - Mobile and desktop optimized
- **Smooth Animations** - Subtle transitions and hover effects
- **Accessibility** - WCAG compliant with proper contrast ratios
- **SEO Optimized** - Meta tags and structured content

## 🎨 Color Scheme

- **Primary**: `#0D1117` (Dark background)
- **Secondary**: `#161B22` (Card backgrounds)
- **Accent**: `#5CFAEA` (Primary actions, highlights)
- **Highlight**: `#26A85E` (Success states, secondary actions)
- **Text**: `#C9D1D9` (Primary text)
- **Text Muted**: `#8B949E` (Secondary text)

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Security**: Helmet.js, express-validator, sanitize-html
- **Hosting**: Vercel (configured)
- **Database**: JSON-based (easily extensible to MongoDB/PostgreSQL)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cybersecurity-club-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Create .env file (optional for development)
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the website**
   - Open `http://localhost:3000` in your browser

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Link to existing project or create new
   - Set environment variables if needed
   - Deploy

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
cybersecurity-club-website/
├── public/                 # Static files
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   ├── js/
│   │   ├── main.js        # Core functionality
│   │   ├── events.js      # Events page logic
│   │   ├── blog.js        # Blog page logic
│   │   └── contact.js     # Contact form logic
│   ├── images/            # Image assets
│   ├── index.html         # Home page
│   ├── events.html        # Events page
│   ├── leadership.html    # Leadership page
│   ├── blog.html          # Blog page
│   ├── contact.html       # Contact page
│   └── 404.html          # Error page
├── server.js              # Express server
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── README.md             # Documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=3000
# Add email configuration for contact form
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

### Customization

#### Adding New Events
Edit the events array in `server.js`:

```javascript
const events = [
  {
    id: 4,
    title: "New Event Title",
    date: "2024-03-20",
    time: "19:00",
    location: "Event Location",
    description: "Event description",
    image: "/images/event-image.jpg"
  }
];
```

#### Adding Blog Posts
Edit the blogPosts array in `server.js`:

```javascript
const blogPosts = [
  {
    id: 4,
    title: "New Blog Post",
    excerpt: "Post excerpt",
    content: "Full post content",
    author: "Author Name",
    date: "2024-01-20",
    readTime: "5 min read",
    image: "/images/blog-image.jpg"
  }
];
```

## 🔒 Security Features

### Backend Security
- **Helmet.js** - Security headers
- **Rate Limiting** - API protection
- **Input Validation** - Server-side validation
- **XSS Protection** - HTML sanitization
- **CORS** - Cross-origin security

### Frontend Security
- **Content Security Policy** - XSS prevention
- **Input Sanitization** - Client-side protection
- **Form Validation** - Real-time validation
- **Honeypot** - Bot protection

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## ♿ Accessibility

- **WCAG 2.1 AA** compliant
- **Keyboard navigation** support
- **Screen reader** friendly
- **High contrast** mode support
- **Focus indicators** for all interactive elements

## 🧪 Testing

### Manual Testing Checklist

- [ ] All pages load correctly
- [ ] Navigation works on all devices
- [ ] Contact form validation
- [ ] Events load from API
- [ ] Blog posts load from API
- [ ] Responsive design on all screen sizes
- [ ] Security headers are present
- [ ] Form submission works

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

### Version 1.0.0
- Initial release
- Complete website with all pages
- Security features implemented
- Responsive design
- Vercel deployment ready

---

**Built with ❤️ for the cybersecurity community** 