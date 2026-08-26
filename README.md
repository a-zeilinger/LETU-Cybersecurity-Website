# LETU Cybersecurity Club Website

Static informational website for the LeTourneau University Cybersecurity Club.

## Purpose

The site is intentionally simple. It provides:

- Club overview
- Weekly meeting information
- Fall 2026 schedule
- Leadership information
- Contact information

There is no application backend, database, authentication system, admin dashboard, built-in CTF platform, Redis cache, or Socket.IO service.

## Structure

```text
index.html
 events.html
 leadership.html
 contact.html
 css/style.css
 js/main.js
 vercel.json
```

## Local preview

You can open `index.html` directly in a browser, or serve the folder with any static web server.

For example, with Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The site is configured for Vercel as a static website. The `vercel.json` file provides clean routes and a small set of security-related response headers.

## Updating the semester schedule

Edit `events.html`. Each meeting is represented by one `schedule-item` article. No database or API update is required.
