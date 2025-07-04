// Admin Panel JavaScript
const API_BASE = '../api';
let currentUser = null;
let currentPage = 1;
let editingPostId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupEventListeners();
});

// Authentication
async function checkAuthentication() {
    try {
        const response = await fetch(`${API_BASE}/auth.php?action=check`);
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            showDashboard();
            loadPosts();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    document.getElementById('user-info').textContent = `Welcome, ${currentUser.username}`;
}

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // New post button
    document.getElementById('new-post-btn').addEventListener('click', showNewPostForm);
    
    // Post form
    document.getElementById('post-form').addEventListener('submit', handleSavePost);
    
    // Cancel edit
    document.getElementById('cancel-edit').addEventListener('click', showPostsList);
    document.getElementById('back-to-posts').addEventListener('click', showPostsList);
    
    // Delete post
    document.getElementById('delete-post').addEventListener('click', handleDeletePost);
    
    // Filters
    document.getElementById('status-filter').addEventListener('change', () => {
        currentPage = 1;
        loadPosts();
    });
    document.getElementById('category-filter').addEventListener('change', () => {
        currentPage = 1;
        loadPosts();
    });
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const response = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            showDashboard();
            loadPosts();
            errorDiv.textContent = '';
        } else {
            errorDiv.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
    }
}

// Logout Handler
async function handleLogout() {
    try {
        await fetch(`${API_BASE}/auth.php?action=logout`, {
            method: 'POST'
        });
        currentUser = null;
        showLogin();
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    const section = e.target.getAttribute('href').substring(1);
    
    switch (section) {
        case 'posts':
            showPostsList();
            break;
        case 'new-post':
            showNewPostForm();
            break;
        // Add more sections as needed
    }
}

// Posts Management
async function loadPosts() {
    const status = document.getElementById('status-filter').value;
    const category = document.getElementById('category-filter').value;
    
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 10,
            status: status,
            category: category
        });
        
        const response = await fetch(`${API_BASE}/posts.php?${params}`);
        const data = await response.json();
        
        if (data.success) {
            displayPosts(data.data);
            displayPagination(data.pagination);
        }
    } catch (error) {
        console.error('Failed to load posts:', error);
    }
}

function displayPosts(posts) {
    const tbody = document.getElementById('posts-list');
    
    if (posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No posts found</td></tr>';
        return;
    }
    
    tbody.innerHTML = posts.map(post => `
        <tr>
            <td>${escapeHtml(post.title)}</td>
            <td>${escapeHtml(post.author)}</td>
            <td>${escapeHtml(post.category)}</td>
            <td><span class="status-badge status-${post.status}">${post.status}</span></td>
            <td>${formatDate(post.published_at || post.created_at)}</td>
            <td>${post.views}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editPost(${post.id})">Edit</button>
                    <a href="${SITE_URL}#blog-${post.slug}" target="_blank" class="btn btn-primary">View</a>
                </div>
            </td>
        </tr>
    `).join('');
}

function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    let html = '';
    
    // Previous button
    html += `<button onclick="changePage(${pagination.page - 1})" ${pagination.page === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === 1 || i === pagination.pages || (i >= pagination.page - 2 && i <= pagination.page + 2)) {
            html += `<button onclick="changePage(${i})" class="${i === pagination.page ? 'active' : ''}">${i}</button>`;
        } else if (i === pagination.page - 3 || i === pagination.page + 3) {
            html += '<span>...</span>';
        }
    }
    
    // Next button
    html += `<button onclick="changePage(${pagination.page + 1})" ${pagination.page === pagination.pages ? 'disabled' : ''}>Next</button>`;
    
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadPosts();
}

// Post Editor
function showPostsList() {
    document.getElementById('posts-section').style.display = 'block';
    document.getElementById('editor-section').style.display = 'none';
    loadPosts();
}

function showNewPostForm() {
    editingPostId = null;
    document.getElementById('editor-title').textContent = 'New Post';
    document.getElementById('post-form').reset();
    document.getElementById('delete-post').style.display = 'none';
    document.getElementById('posts-section').style.display = 'none';
    document.getElementById('editor-section').style.display = 'block';
}

async function editPost(id) {
    try {
        const response = await fetch(`${API_BASE}/posts.php?id=${id}`);
        const data = await response.json();
        
        if (data.success) {
            const post = data.data;
            editingPostId = id;
            
            document.getElementById('editor-title').textContent = 'Edit Post';
            document.getElementById('post-title').value = post.title || '';
            document.getElementById('post-title-nl').value = post.title_nl || '';
            document.getElementById('post-author').value = post.author || '';
            document.getElementById('post-category').value = post.category || 'General';
            document.getElementById('post-status').value = post.status || 'draft';
            document.getElementById('post-excerpt').value = post.excerpt || '';
            document.getElementById('post-excerpt-nl').value = post.excerpt_nl || '';
            document.getElementById('post-content').value = post.content || '';
            document.getElementById('post-content-nl').value = post.content_nl || '';
            document.getElementById('post-image').value = post.featured_image || '';
            
            document.getElementById('delete-post').style.display = 'inline-block';
            document.getElementById('posts-section').style.display = 'none';
            document.getElementById('editor-section').style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to load post:', error);
        alert('Failed to load post');
    }
}

async function handleSavePost(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const postData = {};
    formData.forEach((value, key) => {
        postData[key] = value;
    });
    
    try {
        const url = editingPostId 
            ? `${API_BASE}/posts.php?id=${editingPostId}`
            : `${API_BASE}/posts.php`;
        
        const response = await fetch(url, {
            method: editingPostId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(editingPostId ? 'Post updated successfully' : 'Post created successfully');
            showPostsList();
        } else {
            alert(data.error || 'Failed to save post');
        }
    } catch (error) {
        console.error('Failed to save post:', error);
        alert('Failed to save post');
    }
}

async function handleDeletePost() {
    if (!editingPostId) return;
    
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_BASE}/posts.php?id=${editingPostId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Post deleted successfully');
                showPostsList();
            } else {
                alert(data.error || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post');
        }
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Constants - Update these
const SITE_URL = 'https://yourdomain.com';