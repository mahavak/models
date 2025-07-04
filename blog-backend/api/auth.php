<?php
require_once '../config.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'login':
        if ($method === 'POST') {
            handleLogin();
        }
        break;
        
    case 'logout':
        if ($method === 'POST') {
            handleLogout();
        }
        break;
        
    case 'check':
        if ($method === 'GET') {
            checkAuth();
        }
        break;
        
    case 'register':
        if ($method === 'POST') {
            handleRegister();
        }
        break;
}

function handleLogin() {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = sanitize($data['username'] ?? '');
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username and password required']);
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM admin_users WHERE username = :username OR email = :username");
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        // Update last login
        $db->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = :id")
           ->execute([':id' => $user['id']]);
        
        // Set session
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['admin_username'] = $user['username'];
        $_SESSION['admin_role'] = $user['role'];
        
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    }
}

function handleLogout() {
    session_destroy();
    echo json_encode(['success' => true]);
}

function checkAuth() {
    if (isLoggedIn()) {
        echo json_encode([
            'success' => true,
            'authenticated' => true,
            'user' => [
                'id' => $_SESSION['admin_id'],
                'username' => $_SESSION['admin_username'],
                'role' => $_SESSION['admin_role']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'authenticated' => false
        ]);
    }
}

function handleRegister() {
    // Only allow if no users exist or if logged in as admin
    $db = getDB();
    $stmt = $db->prepare("SELECT COUNT(*) FROM admin_users");
    $stmt->execute();
    $userCount = $stmt->fetchColumn();
    
    if ($userCount > 0 && (!isLoggedIn() || $_SESSION['admin_role'] !== 'admin')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Registration not allowed']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $username = sanitize($data['username'] ?? '');
    $email = sanitize($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $name = sanitize($data['name'] ?? '');
    
    if (empty($username) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'All fields required']);
        return;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    try {
        $stmt = $db->prepare("INSERT INTO admin_users (username, email, password, name, role) 
                              VALUES (:username, :email, :password, :name, :role)");
        $stmt->execute([
            ':username' => $username,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':name' => $name,
            ':role' => $userCount === 0 ? 'admin' : 'editor'
        ]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username or email already exists']);
    }
}
?>