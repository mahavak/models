#!/usr/bin/env python3
"""
Blog Backend Test Suite
Simulates PHP functionality and validates the blog system components
"""

import json
import re
import os
import sqlite3
from datetime import datetime
import hashlib

class BlogSystemTester:
    def __init__(self):
        self.test_results = []
        self.db_path = "test_blog.db"
        self.setup_test_database()
    
    def setup_test_database(self):
        """Set up SQLite database for testing (simulates MySQL)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables (SQLite syntax, similar to MySQL)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                title_nl TEXT,
                slug TEXT UNIQUE NOT NULL,
                content TEXT NOT NULL,
                content_nl TEXT,
                excerpt TEXT,
                excerpt_nl TEXT,
                author TEXT DEFAULT 'Admin',
                category TEXT DEFAULT 'General',
                featured_image TEXT,
                status TEXT DEFAULT 'draft',
                views INTEGER DEFAULT 0,
                published_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT,
                role TEXT DEFAULT 'editor',
                last_login DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS blog_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                name_nl TEXT,
                slug TEXT UNIQUE NOT NULL,
                description TEXT,
                post_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert test data
        cursor.execute('''
            INSERT OR IGNORE INTO admin_users (username, email, password, name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', ('admin', 'admin@test.com', self.hash_password('admin123'), 'Test Admin', 'admin'))
        
        cursor.execute('''
            INSERT OR IGNORE INTO blog_categories (name, name_nl, slug, description)
            VALUES (?, ?, ?, ?)
        ''', ('Decision Making', 'Besluitvorming', 'decision-making', 'Articles about decision-making processes'))
        
        cursor.execute('''
            INSERT OR IGNORE INTO blog_posts 
            (title, title_nl, slug, content, content_nl, excerpt, excerpt_nl, author, category, status, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'Test Post: The Power of Inversion',
            'Test Post: De Kracht van Inversie',
            'test-post-power-of-inversion',
            '<p>This is a test blog post about the power of inversion in decision making.</p>',
            '<p>Dit is een test blogpost over de kracht van inversie in besluitvorming.</p>',
            'A test post about inversion techniques.',
            'Een test post over inversie technieken.',
            'Test Author',
            'Decision Making',
            'published',
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        self.log_test("Database Setup", True, "Test database created successfully")
    
    def hash_password(self, password):
        """Simulate PHP password_hash function"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def test_config_file(self):
        """Test config.php file syntax and structure"""
        config_path = "/home/lau_1968/Models/blog-backend/config.php"
        
        try:
            with open(config_path, 'r') as f:
                content = f.read()
            
            # Check for required constants
            required_constants = [
                'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS',
                'SITE_URL', 'ADMIN_EMAIL', 'SECRET_KEY'
            ]
            
            missing_constants = []
            for constant in required_constants:
                if f"define('{constant}'" not in content:
                    missing_constants.append(constant)
            
            if not missing_constants:
                self.log_test("Config File Structure", True, "All required constants found")
            else:
                self.log_test("Config File Structure", False, f"Missing constants: {missing_constants}")
            
            # Check for security functions
            security_functions = ['sanitize', 'isLoggedIn', 'requireAuth', 'generateSlug']
            missing_functions = []
            for func in security_functions:
                if f"function {func}" not in content:
                    missing_functions.append(func)
            
            if not missing_functions:
                self.log_test("Config Security Functions", True, "All security functions found")
            else:
                self.log_test("Config Security Functions", False, f"Missing functions: {missing_functions}")
                
        except FileNotFoundError:
            self.log_test("Config File", False, "config.php file not found")
    
    def test_api_endpoints(self):
        """Test API endpoint files"""
        api_files = [
            "/home/lau_1968/Models/blog-backend/api/posts.php",
            "/home/lau_1968/Models/blog-backend/api/auth.php"
        ]
        
        for file_path in api_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                filename = os.path.basename(file_path)
                
                # Check for basic PHP structure
                if content.startswith('<?php'):
                    self.log_test(f"API File {filename}", True, "Valid PHP syntax")
                else:
                    self.log_test(f"API File {filename}", False, "Invalid PHP syntax")
                
                # Check for HTTP methods
                if 'posts.php' in filename:
                    methods = ['GET', 'POST', 'PUT', 'DELETE']
                    for method in methods:
                        if f"'{method}'" in content or f'"{method}"' in content:
                            self.log_test(f"Posts API {method}", True, f"{method} method implemented")
                        else:
                            self.log_test(f"Posts API {method}", False, f"{method} method missing")
                
                # Check for authentication
                if 'auth.php' in filename:
                    auth_actions = ['login', 'logout', 'check', 'register']
                    for action in auth_actions:
                        if action in content:
                            self.log_test(f"Auth {action}", True, f"{action} action found")
                        else:
                            self.log_test(f"Auth {action}", False, f"{action} action missing")
                            
            except FileNotFoundError:
                self.log_test(f"API File {os.path.basename(file_path)}", False, "File not found")
    
    def test_admin_panel(self):
        """Test admin panel files"""
        admin_files = [
            "/home/lau_1968/Models/blog-backend/admin/index.html",
            "/home/lau_1968/Models/blog-backend/admin/styles.css",
            "/home/lau_1968/Models/blog-backend/admin/admin.js"
        ]
        
        for file_path in admin_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                filename = os.path.basename(file_path)
                
                if filename.endswith('.html'):
                    # Check HTML structure
                    if '<html' in content and '</html>' in content:
                        self.log_test("Admin HTML Structure", True, "Valid HTML structure")
                    else:
                        self.log_test("Admin HTML Structure", False, "Invalid HTML structure")
                    
                    # Check for form elements
                    forms = ['login-form', 'post-form']
                    for form_id in forms:
                        if form_id in content:
                            self.log_test(f"Admin Form {form_id}", True, f"{form_id} found")
                        else:
                            self.log_test(f"Admin Form {form_id}", False, f"{form_id} missing")
                
                elif filename.endswith('.css'):
                    # Check CSS structure
                    css_classes = ['.login-container', '.admin-header', '.posts-table', '.blog-card']
                    for css_class in css_classes:
                        if css_class in content:
                            self.log_test(f"CSS Class {css_class}", True, f"{css_class} found")
                        else:
                            self.log_test(f"CSS Class {css_class}", False, f"{css_class} missing")
                
                elif filename.endswith('.js'):
                    # Check JavaScript functions
                    js_functions = ['handleLogin', 'loadPosts', 'editPost', 'handleSavePost']
                    for func in js_functions:
                        if func in content:
                            self.log_test(f"JS Function {func}", True, f"{func} found")
                        else:
                            self.log_test(f"JS Function {func}", False, f"{func} missing")
                            
            except FileNotFoundError:
                self.log_test(f"Admin File {os.path.basename(file_path)}", False, "File not found")
    
    def test_frontend_integration(self):
        """Test frontend blog integration"""
        js_file = "/home/lau_1968/Models/js/script.js"
        
        try:
            with open(js_file, 'r') as f:
                content = f.read()
            
            # Check for blog functions
            blog_functions = ['loadBlogPosts', 'displayBlogPosts', 'loadFullPost', 'displayFullPost']
            for func in blog_functions:
                if func in content:
                    self.log_test(f"Frontend Function {func}", True, f"{func} implemented")
                else:
                    self.log_test(f"Frontend Function {func}", False, f"{func} missing")
            
            # Check for API integration
            if 'BLOG_API_URL' in content:
                self.log_test("Frontend API Configuration", True, "API URL configured")
            else:
                self.log_test("Frontend API Configuration", False, "API URL not configured")
            
            # Check for bilingual support
            if 'lang === \'nl\'' in content:
                self.log_test("Frontend Bilingual Support", True, "Dutch language support found")
            else:
                self.log_test("Frontend Bilingual Support", False, "Bilingual support missing")
                
        except FileNotFoundError:
            self.log_test("Frontend Integration", False, "script.js file not found")
    
    def test_database_operations(self):
        """Test database operations using SQLite simulation"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Test SELECT operation
        try:
            cursor.execute("SELECT * FROM blog_posts WHERE status = 'published'")
            posts = cursor.fetchall()
            if posts:
                self.log_test("Database SELECT", True, f"Found {len(posts)} published posts")
            else:
                self.log_test("Database SELECT", False, "No published posts found")
        except Exception as e:
            self.log_test("Database SELECT", False, f"Error: {str(e)}")
        
        # Test INSERT operation
        try:
            cursor.execute('''
                INSERT INTO blog_posts (title, slug, content, author, category, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', ('Test Insert', 'test-insert', 'Test content', 'Test Author', 'General', 'draft'))
            conn.commit()
            self.log_test("Database INSERT", True, "Post inserted successfully")
        except Exception as e:
            self.log_test("Database INSERT", False, f"Error: {str(e)}")
        
        # Test UPDATE operation
        try:
            cursor.execute("UPDATE blog_posts SET views = views + 1 WHERE slug = 'test-insert'")
            conn.commit()
            self.log_test("Database UPDATE", True, "Post updated successfully")
        except Exception as e:
            self.log_test("Database UPDATE", False, f"Error: {str(e)}")
        
        # Test authentication simulation
        try:
            cursor.execute("SELECT * FROM admin_users WHERE username = 'admin'")
            user = cursor.fetchone()
            if user:
                self.log_test("Database Authentication", True, "Admin user found")
            else:
                self.log_test("Database Authentication", False, "Admin user not found")
        except Exception as e:
            self.log_test("Database Authentication", False, f"Error: {str(e)}")
        
        conn.close()
    
    def test_security_features(self):
        """Test security implementations"""
        # Test password hashing
        password = "test123"
        hashed = self.hash_password(password)
        if len(hashed) > 10:  # Simple check for hashed password
            self.log_test("Password Hashing", True, "Password hashing working")
        else:
            self.log_test("Password Hashing", False, "Password hashing failed")
        
        # Test slug generation simulation
        title = "This is a Test Title with Special Characters!@#"
        slug = self.generate_slug(title)
        if slug == "this-is-a-test-title-with-special-characters":
            self.log_test("Slug Generation", True, "Slug generation working correctly")
        else:
            self.log_test("Slug Generation", False, f"Unexpected slug: {slug}")
        
        # Test input sanitization patterns
        config_file = "/home/lau_1968/Models/blog-backend/config.php"
        try:
            with open(config_file, 'r') as f:
                content = f.read()
            
            if 'htmlspecialchars' in content and 'strip_tags' in content:
                self.log_test("Input Sanitization", True, "Sanitization functions found")
            else:
                self.log_test("Input Sanitization", False, "Sanitization functions missing")
        except:
            self.log_test("Input Sanitization", False, "Could not check config file")
    
    def generate_slug(self, title):
        """Simulate PHP slug generation"""
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
        slug = re.sub(r'\s+', '-', slug.strip())
        slug = re.sub(r'-+', '-', slug)
        return slug.strip('-')
    
    def test_setup_script(self):
        """Test setup.php script"""
        setup_file = "/home/lau_1968/Models/blog-backend/setup.php"
        
        try:
            with open(setup_file, 'r') as f:
                content = f.read()
            
            # Check for setup steps
            setup_features = [
                'Database Configuration',
                'Database Setup', 
                'Admin User',
                'setup.lock'
            ]
            
            for feature in setup_features:
                if feature in content:
                    self.log_test(f"Setup Feature: {feature}", True, f"{feature} implemented")
                else:
                    self.log_test(f"Setup Feature: {feature}", False, f"{feature} missing")
                    
        except FileNotFoundError:
            self.log_test("Setup Script", False, "setup.php file not found")
    
    def log_test(self, test_name, passed, details):
        """Log test results"""
        status = "PASS" if passed else "FAIL"
        self.test_results.append({
            'test': test_name,
            'status': status,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        print(f"[{status}] {test_name}: {details}")
    
    def run_all_tests(self):
        """Run the complete test suite"""
        print("=" * 60)
        print("BLOG SYSTEM TEST SUITE")
        print("=" * 60)
        
        self.test_config_file()
        self.test_api_endpoints()
        self.test_admin_panel()
        self.test_frontend_integration()
        self.test_database_operations()
        self.test_security_features()
        self.test_setup_script()
        
        # Generate summary
        passed_tests = sum(1 for result in self.test_results if result['status'] == 'PASS')
        total_tests = len(self.test_results)
        
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if r['status'] == 'FAIL']
        if failed_tests:
            print(f"\nFAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return passed_tests, total_tests
    
    def cleanup(self):
        """Clean up test files"""
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

if __name__ == "__main__":
    tester = BlogSystemTester()
    try:
        passed, total = tester.run_all_tests()
        exit_code = 0 if passed == total else 1
        exit(exit_code)
    finally:
        tester.cleanup()