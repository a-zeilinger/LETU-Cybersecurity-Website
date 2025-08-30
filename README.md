# LETU Cybersecurity Club Website

## File Structure
This website has been reorganized to fix deployment issues. The main files are now in the root directory.

## Essential Files (Already Created)
- `vercel.json` - Vercel deployment configuration (v2 format)
- `package.json` - Node.js dependencies and scripts
- `server.js` - Express server with security middleware

## Files That Need to Be Copied
You need to copy the following from `LETU-Cybersecurity-Website-main/public/` to `public/`:

### HTML Files
- `index.html` - Main homepage
- `events.html` - Events page
- `leadership.html` - Leadership page
- `blog.html` - Blog page
- `contact.html` - Contact page
- `404.html` - 404 error page
- `index-standalone.html` - Standalone version

### Directories
- `css/` - Stylesheets
- `js/` - JavaScript files

## Quick Setup
1. Copy the `public/` directory from `LETU-Cybersecurity-Website-main/` to the root
2. Run `npm install` to install dependencies
3. Deploy to Vercel

## Security Features
- Helmet.js for security headers
- Rate limiting
- Input sanitization
- XSS protection
- CORS configuration

## Deployment
The `vercel.json` is configured for Vercel v2 deployment with:
- Node.js serverless function
- Static file serving
- API routing
- Environment variables
