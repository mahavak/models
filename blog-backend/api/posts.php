<?php
require_once '../config.php';

// Set CORS headers
setCorsHeaders();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

// Get post ID from URL if provided
$postId = isset($_GET['id']) ? intval($_GET['id']) : null;
$slug = isset($_GET['slug']) ? sanitize($_GET['slug']) : null;

switch ($method) {
    case 'GET':
        if ($postId) {
            // Get single post by ID
            getPostById($db, $postId);
        } elseif ($slug) {
            // Get single post by slug
            getPostBySlug($db, $slug);
        } else {
            // Get all posts
            getAllPosts($db);
        }
        break;
        
    case 'POST':
        requireAuth();
        createPost($db);
        break;
        
    case 'PUT':
        requireAuth();
        if ($postId) {
            updatePost($db, $postId);
        }
        break;
        
    case 'DELETE':
        requireAuth();
        if ($postId) {
            deletePost($db, $postId);
        }
        break;
}

function getAllPosts($db) {
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 10;
    $offset = ($page - 1) * $limit;
    $status = isset($_GET['status']) ? sanitize($_GET['status']) : 'published';
    $category = isset($_GET['category']) ? sanitize($_GET['category']) : null;
    
    // Build query
    $where = [];
    $params = [];
    
    if ($status !== 'all') {
        $where[] = 'status = :status';
        $params[':status'] = $status;
    }
    
    if ($category) {
        $where[] = 'category = :category';
        $params[':category'] = $category;
    }
    
    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
    
    // Get total count
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM blog_posts $whereClause");
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Get posts
    $sql = "SELECT id, title, title_nl, slug, excerpt, excerpt_nl, author, category, 
            featured_image, status, views, published_at, created_at 
            FROM blog_posts 
            $whereClause 
            ORDER BY published_at DESC 
            LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $posts = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => $posts,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

function getPostById($db, $id) {
    $stmt = $db->prepare("SELECT * FROM blog_posts WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $post = $stmt->fetch();
    
    if ($post) {
        // Increment view count
        $db->prepare("UPDATE blog_posts SET views = views + 1 WHERE id = :id")
           ->execute([':id' => $id]);
           
        echo json_encode(['success' => true, 'data' => $post]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Post not found']);
    }
}

function getPostBySlug($db, $slug) {
    $stmt = $db->prepare("SELECT * FROM blog_posts WHERE slug = :slug AND status = 'published'");
    $stmt->execute([':slug' => $slug]);
    $post = $stmt->fetch();
    
    if ($post) {
        // Increment view count
        $db->prepare("UPDATE blog_posts SET views = views + 1 WHERE id = :id")
           ->execute([':id' => $post['id']]);
           
        echo json_encode(['success' => true, 'data' => $post]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Post not found']);
    }
}

function createPost($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $title = sanitize($data['title'] ?? '');
    $title_nl = sanitize($data['title_nl'] ?? '');
    $content = $data['content'] ?? '';
    $content_nl = $data['content_nl'] ?? '';
    $excerpt = sanitize($data['excerpt'] ?? '');
    $excerpt_nl = sanitize($data['excerpt_nl'] ?? '');
    $author = sanitize($data['author'] ?? 'Admin');
    $category = sanitize($data['category'] ?? 'General');
    $featured_image = sanitize($data['featured_image'] ?? '');
    $status = sanitize($data['status'] ?? 'draft');
    $slug = generateSlug($title);
    
    // Check if slug exists
    $checkSlug = $db->prepare("SELECT COUNT(*) FROM blog_posts WHERE slug = :slug");
    $checkSlug->execute([':slug' => $slug]);
    if ($checkSlug->fetchColumn() > 0) {
        $slug .= '-' . time();
    }
    
    $sql = "INSERT INTO blog_posts 
            (title, title_nl, slug, content, content_nl, excerpt, excerpt_nl, 
             author, category, featured_image, status, published_at) 
            VALUES 
            (:title, :title_nl, :slug, :content, :content_nl, :excerpt, :excerpt_nl,
             :author, :category, :featured_image, :status, :published_at)";
    
    $stmt = $db->prepare($sql);
    $result = $stmt->execute([
        ':title' => $title,
        ':title_nl' => $title_nl,
        ':slug' => $slug,
        ':content' => $content,
        ':content_nl' => $content_nl,
        ':excerpt' => $excerpt,
        ':excerpt_nl' => $excerpt_nl,
        ':author' => $author,
        ':category' => $category,
        ':featured_image' => $featured_image,
        ':status' => $status,
        ':published_at' => $status === 'published' ? date('Y-m-d H:i:s') : null
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'data' => ['id' => $db->lastInsertId(), 'slug' => $slug]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create post']);
    }
}

function updatePost($db, $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $db->prepare("UPDATE blog_posts SET 
        title = :title,
        title_nl = :title_nl,
        content = :content,
        content_nl = :content_nl,
        excerpt = :excerpt,
        excerpt_nl = :excerpt_nl,
        author = :author,
        category = :category,
        featured_image = :featured_image,
        status = :status,
        published_at = :published_at
        WHERE id = :id");
    
    $result = $stmt->execute([
        ':title' => sanitize($data['title'] ?? ''),
        ':title_nl' => sanitize($data['title_nl'] ?? ''),
        ':content' => $data['content'] ?? '',
        ':content_nl' => $data['content_nl'] ?? '',
        ':excerpt' => sanitize($data['excerpt'] ?? ''),
        ':excerpt_nl' => sanitize($data['excerpt_nl'] ?? ''),
        ':author' => sanitize($data['author'] ?? 'Admin'),
        ':category' => sanitize($data['category'] ?? 'General'),
        ':featured_image' => sanitize($data['featured_image'] ?? ''),
        ':status' => sanitize($data['status'] ?? 'draft'),
        ':published_at' => $data['status'] === 'published' ? date('Y-m-d H:i:s') : null,
        ':id' => $id
    ]);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update post']);
    }
}

function deletePost($db, $id) {
    $stmt = $db->prepare("DELETE FROM blog_posts WHERE id = :id");
    $result = $stmt->execute([':id' => $id]);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete post']);
    }
}
?>