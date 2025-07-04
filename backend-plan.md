# Backend Architecture Plan for Mental Models Website

## Overview
This document outlines the backend architecture for the blog and contact form functionality.

## Technology Stack Recommendations

### Option 1: Node.js + Express (Recommended)
- **Server**: Node.js with Express.js
- **Database**: PostgreSQL for blog posts, contact submissions
- **ORM**: Prisma or Sequelize
- **Authentication**: JWT for admin panel
- **Email**: Nodemailer with SendGrid/Mailgun
- **Hosting**: DigitalOcean App Platform, Heroku, or AWS

### Option 2: Python + Django/FastAPI
- **Server**: Django REST Framework or FastAPI
- **Database**: PostgreSQL
- **ORM**: Django ORM or SQLAlchemy
- **Authentication**: Django Auth or JWT
- **Email**: Django Email with SendGrid
- **Hosting**: DigitalOcean, PythonAnywhere, or AWS

### Option 3: Serverless (Cost-Effective)
- **Functions**: Netlify Functions or Vercel Serverless
- **Database**: Supabase or PlanetScale
- **Email**: SendGrid API
- **Storage**: Cloudinary for images
- **Hosting**: Netlify or Vercel

## Database Schema

### Blog Posts Table
```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_nl VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    content_nl TEXT,
    excerpt TEXT,
    excerpt_nl TEXT,
    author VARCHAR(100),
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Contact Submissions Table
```sql
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    newsletter BOOLEAN DEFAULT false,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Newsletter Subscribers Table
```sql
CREATE TABLE newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);
```

## API Endpoints

### Blog Endpoints
- `GET /api/posts` - List all published posts (paginated)
- `GET /api/posts/:slug` - Get single post by slug
- `GET /api/posts/categories` - List all categories
- `POST /api/posts` - Create new post (admin only)
- `PUT /api/posts/:id` - Update post (admin only)
- `DELETE /api/posts/:id` - Delete post (admin only)

### Contact Form Endpoint
- `POST /api/contact` - Submit contact form

### Newsletter Endpoints
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter

## Security Considerations
1. **Rate Limiting**: Implement rate limiting for contact form (5 submissions per hour per IP)
2. **CORS**: Configure CORS for your domain only
3. **Validation**: Server-side validation for all inputs
4. **Sanitization**: Clean HTML content to prevent XSS
5. **HTTPS**: Enforce HTTPS for all API calls
6. **Environment Variables**: Store sensitive data in .env files
7. **SQL Injection**: Use parameterized queries
8. **Email Verification**: Verify email addresses before adding to newsletter

## Email Templates
1. **Contact Form Confirmation**: Auto-reply to user
2. **Contact Form Notification**: Alert to admin
3. **Newsletter Welcome**: Welcome email for new subscribers
4. **Newsletter Weekly**: Weekly digest of new blog posts

## Admin Panel Features
1. **Blog Management**: CRUD operations for blog posts
2. **Contact Submissions**: View and manage contact form submissions
3. **Newsletter Management**: Manage subscribers, send newsletters
4. **Analytics Dashboard**: View site statistics

## Implementation Steps
1. Set up server and database
2. Create database schema
3. Build API endpoints
4. Implement authentication
5. Set up email service
6. Create admin panel
7. Connect frontend to backend
8. Deploy and test

## Cost Estimates
- **Serverless**: ~$0-20/month (Netlify/Vercel free tier)
- **VPS Hosting**: ~$20-50/month (DigitalOcean/Linode)
- **Email Service**: ~$10-35/month (SendGrid/Mailgun)
- **Database**: ~$15-25/month (managed PostgreSQL)

## Recommended First Steps
1. Start with serverless functions for contact form
2. Use Supabase for database (generous free tier)
3. Implement SendGrid for email notifications
4. Add blog functionality after contact form is working