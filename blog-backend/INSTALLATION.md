# Blog Backend Installation Guide

This guide will help you set up the blog backend on Hostinger or any PHP hosting provider.

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web hosting with PHP and MySQL support (like Hostinger)
- FTP/cPanel access to your hosting

## Step 1: Database Setup

### Option A: Using phpMyAdmin (Recommended for Hostinger)

1. **Login to cPanel** and open phpMyAdmin
2. **Create a new database** (e.g., `yourdomain_blog`)
3. **Create a database user** with full privileges
4. **Import the SQL file**:
   - Go to the Import tab in phpMyAdmin
   - Select the `install.sql` file
   - Click "Go" to execute

### Option B: Manual SQL Execution

If you can't import the file, copy and paste the contents of `install.sql` into the SQL tab in phpMyAdmin.

## Step 2: File Upload

### Upload Backend Files

1. **Create a directory** called `blog-backend` in your website's root directory
2. **Upload all backend files** via FTP or File Manager:
   ```
   /public_html/blog-backend/
   ├── config.php
   ├── api/
   │   ├── posts.php
   │   └── auth.php
   ├── admin/
   │   ├── index.html
   │   ├── styles.css
   │   └── admin.js
   └── install.sql
   ```

### Update Main Website

3. **Update your main website files** with the new frontend code:
   - Replace your existing `index.html`, `css/styles.css`, and `js/script.js`
   - Or merge the blog-related code into your existing files

## Step 3: Configuration

### Configure Database Connection

1. **Edit `config.php`** and update the database settings:
   ```php
   define('DB_HOST', 'localhost');  // Usually localhost for Hostinger
   define('DB_NAME', 'yourdomain_blog');  // Your database name
   define('DB_USER', 'yourdomain_user');  // Your database username
   define('DB_PASS', 'your_password');    // Your database password
   ```

2. **Update site settings**:
   ```php
   define('SITE_URL', 'https://yourdomain.com');
   define('ADMIN_EMAIL', 'admin@yourdomain.com');
   define('SECRET_KEY', 'your-unique-secret-key-here');
   ```

### Configure Frontend API URL

3. **Edit `js/script.js`** and update the API URL:
   ```javascript
   const BLOG_API_URL = '/blog-backend/api'; // Update if needed
   ```

## Step 4: Create Admin User

### Option A: Use the Registration Endpoint (First Time Only)

1. **Create the first admin user** by making a POST request to:
   ```
   https://yourdomain.com/blog-backend/api/auth.php?action=register
   ```
   
   With JSON body:
   ```json
   {
     "username": "admin",
     "email": "admin@yourdomain.com",
     "password": "your_secure_password",
     "name": "Your Name"
   }
   ```

### Option B: Update the SQL Directly

1. **Generate a password hash** using an online PHP password_hash generator
2. **Update the admin user** in the database via phpMyAdmin:
   ```sql
   UPDATE admin_users SET 
   password = '$2y$10$YourHashedPasswordHere' 
   WHERE username = 'admin';
   ```

## Step 5: Security Setup

### File Permissions

Set appropriate file permissions:
- **PHP files**: 644
- **Directories**: 755
- **config.php**: 600 (if supported)

### Secure config.php

Add this to the top of `config.php` for extra security:
```php
<?php
// Prevent direct access
if (!defined('API_ACCESS')) {
    http_response_code(403);
    die('Direct access forbidden');
}
define('API_ACCESS', true);
// ... rest of config
```

And add this to the top of API files:
```php
<?php
define('API_ACCESS', true);
require_once '../config.php';
```

## Step 6: Testing

### Test the Installation

1. **Visit your admin panel**: `https://yourdomain.com/blog-backend/admin/`
2. **Login** with your admin credentials
3. **Create a test blog post**
4. **Check the frontend** to see if the post appears

### Test API Endpoints

Test these URLs in your browser:
- `https://yourdomain.com/blog-backend/api/posts.php?status=published`
- `https://yourdomain.com/blog-backend/api/auth.php?action=check`

## Step 7: SSL Certificate

Ensure your website has an SSL certificate installed. Most hosting providers like Hostinger offer free SSL certificates.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your database credentials in `config.php`
   - Ensure the database user has proper privileges

2. **Permission Denied**
   - Check file permissions
   - Ensure PHP can write to necessary directories

3. **API Not Working**
   - Check if `.htaccess` rules are blocking API calls
   - Verify the API URL in your frontend code

4. **Admin Panel Not Loading**
   - Check browser console for JavaScript errors
   - Verify all files are uploaded correctly

### Enable Debug Mode

Temporarily enable debug mode in `config.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

**Remember to disable this in production!**

## Security Recommendations

1. **Change default admin credentials** immediately after installation
2. **Use strong passwords** for all accounts
3. **Keep your PHP version updated**
4. **Regularly backup your database**
5. **Monitor access logs** for suspicious activity
6. **Use HTTPS** for all admin operations

## Backup Strategy

### Database Backup
Set up automatic database backups through your hosting provider or create a cron job to backup the database weekly.

### File Backup
Regularly backup your blog-backend directory and any customizations to your main website files.

## Support

If you encounter issues:
1. Check the error logs in your hosting control panel
2. Verify all configuration settings
3. Test API endpoints individually
4. Check browser console for JavaScript errors

The system should now be fully functional with a complete blog management system!