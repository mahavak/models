<?php
/**
 * Blog Backend Setup Script
 * Run this once to set up your blog system
 */

// Prevent multiple executions
$lockFile = __DIR__ . '/setup.lock';
if (file_exists($lockFile)) {
    die('Setup has already been completed. Delete setup.lock file to run again.');
}

$error = '';
$success = '';
$step = isset($_GET['step']) ? intval($_GET['step']) : 1;

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($step === 1) {
        // Database configuration
        $config = [
            'host' => $_POST['host'] ?? 'localhost',
            'name' => $_POST['name'] ?? '',
            'user' => $_POST['user'] ?? '',
            'pass' => $_POST['pass'] ?? '',
            'site_url' => $_POST['site_url'] ?? '',
            'admin_email' => $_POST['admin_email'] ?? '',
            'secret_key' => $_POST['secret_key'] ?? bin2hex(random_bytes(32))
        ];
        
        if (empty($config['name']) || empty($config['user'])) {
            $error = 'Database name and user are required.';
        } else {
            // Test database connection
            try {
                $pdo = new PDO(
                    "mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4",
                    $config['user'],
                    $config['pass'],
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                );
                
                // Save configuration
                $configContent = generateConfigFile($config);
                if (file_put_contents(__DIR__ . '/config.php', $configContent)) {
                    $_SESSION['config'] = $config;
                    header('Location: setup.php?step=2');
                    exit;
                } else {
                    $error = 'Could not write config file. Check permissions.';
                }
            } catch (PDOException $e) {
                $error = 'Database connection failed: ' . $e->getMessage();
            }
        }
    } elseif ($step === 2) {
        // Database setup
        try {
            require_once 'config.php';
            $db = getDB();
            
            // Read and execute SQL file
            $sql = file_get_contents(__DIR__ . '/install.sql');
            if ($sql) {
                $db->exec($sql);
                $success = 'Database tables created successfully!';
                header('Location: setup.php?step=3');
                exit;
            } else {
                $error = 'Could not read install.sql file.';
            }
        } catch (Exception $e) {
            $error = 'Database setup failed: ' . $e->getMessage();
        }
    } elseif ($step === 3) {
        // Admin user creation
        try {
            require_once 'config.php';
            $db = getDB();
            
            $username = $_POST['username'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $name = $_POST['name'] ?? '';
            
            if (empty($username) || empty($email) || empty($password)) {
                $error = 'All fields are required.';
            } else {
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                
                $stmt = $db->prepare("INSERT INTO admin_users (username, email, password, name, role) VALUES (?, ?, ?, ?, 'admin')");
                $stmt->execute([$username, $email, $hashedPassword, $name]);
                
                // Create lock file
                file_put_contents($lockFile, date('Y-m-d H:i:s'));
                
                $success = 'Setup completed successfully!';
                $step = 4;
            }
        } catch (Exception $e) {
            $error = 'Admin user creation failed: ' . $e->getMessage();
        }
    }
}

function generateConfigFile($config) {
    return '<?php
// Database configuration
define(\'DB_HOST\', \'' . addslashes($config['host']) . '\');
define(\'DB_NAME\', \'' . addslashes($config['name']) . '\');
define(\'DB_USER\', \'' . addslashes($config['user']) . '\');
define(\'DB_PASS\', \'' . addslashes($config['pass']) . '\');

// Site configuration
define(\'SITE_URL\', \'' . addslashes($config['site_url']) . '\');
define(\'ADMIN_EMAIL\', \'' . addslashes($config['admin_email']) . '\');

// Security
define(\'SECRET_KEY\', \'' . $config['secret_key'] . '\');

// Timezone
date_default_timezone_set(\'Europe/Amsterdam\');

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set(\'display_errors\', 1);

// Start session
session_start();

// Database connection function
function getDB() {
    try {
        $db = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            )
        );
        return $db;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}

// CORS headers for API
function setCorsHeaders() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json; charset=UTF-8");
    
    if ($_SERVER[\'REQUEST_METHOD\'] == \'OPTIONS\') {
        exit(0);
    }
}

// Sanitize input
function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, \'UTF-8\');
}

// Generate slug from title
function generateSlug($title) {
    $slug = strtolower(trim(preg_replace(\'/[^A-Za-z0-9-]+/\', \'-\', $title)));
    return preg_replace(\'/\-+/\', \'-\', $slug);
}

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION[\'admin_logged_in\']) && $_SESSION[\'admin_logged_in\'] === true;
}

// Require authentication
function requireAuth() {
    if (!isLoggedIn()) {
        http_response_code(401);
        die(json_encode([\'error\' => \'Unauthorized\']));
    }
}
?>';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Setup - Mental Models Framework</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .step { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .form-group { margin: 15px 0; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .btn { background: #ff6f00; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #ff8f00; }
        .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .success { color: #155724; background: #d4edda; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .progress { background: #e9ecef; height: 20px; border-radius: 10px; margin: 20px 0; }
        .progress-bar { background: #ff6f00; height: 100%; border-radius: 10px; transition: width 0.3s; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Blog Backend Setup</h1>
        <p>Mental Models Framework</p>
        
        <div class="progress">
            <div class="progress-bar" style="width: <?php echo ($step/4*100); ?>%"></div>
        </div>
        <p>Step <?php echo $step; ?> of 4</p>
    </div>

    <?php if ($error): ?>
        <div class="error"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <?php if ($success): ?>
        <div class="success"><?php echo htmlspecialchars($success); ?></div>
    <?php endif; ?>

    <?php if ($step === 1): ?>
        <div class="step">
            <h2>Step 1: Database Configuration</h2>
            <form method="POST">
                <div class="form-group">
                    <label for="host">Database Host:</label>
                    <input type="text" id="host" name="host" value="localhost" required>
                </div>
                <div class="form-group">
                    <label for="name">Database Name:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="user">Database Username:</label>
                    <input type="text" id="user" name="user" required>
                </div>
                <div class="form-group">
                    <label for="pass">Database Password:</label>
                    <input type="password" id="pass" name="pass">
                </div>
                <div class="form-group">
                    <label for="site_url">Site URL:</label>
                    <input type="url" id="site_url" name="site_url" value="<?php echo 'https://' . $_SERVER['HTTP_HOST']; ?>" required>
                </div>
                <div class="form-group">
                    <label for="admin_email">Admin Email:</label>
                    <input type="email" id="admin_email" name="admin_email" required>
                </div>
                <button type="submit" class="btn">Continue</button>
            </form>
        </div>
    <?php elseif ($step === 2): ?>
        <div class="step">
            <h2>Step 2: Database Setup</h2>
            <p>Click the button below to create the database tables.</p>
            <form method="POST">
                <button type="submit" class="btn">Create Database Tables</button>
            </form>
        </div>
    <?php elseif ($step === 3): ?>
        <div class="step">
            <h2>Step 3: Create Admin User</h2>
            <form method="POST">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="name">Full Name:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <button type="submit" class="btn">Create Admin User</button>
            </form>
        </div>
    <?php else: ?>
        <div class="step">
            <h2>Setup Complete!</h2>
            <p>Your blog backend has been set up successfully.</p>
            <p><strong>Next steps:</strong></p>
            <ul>
                <li><a href="admin/" target="_blank">Access Admin Panel</a></li>
                <li>Delete this setup.php file for security</li>
                <li>Update your frontend API URL if needed</li>
            </ul>
            <p><strong>Security Reminders:</strong></p>
            <ul>
                <li>Set error_reporting to 0 in config.php for production</li>
                <li>Use strong passwords for all accounts</li>
                <li>Regular backup your database</li>
            </ul>
        </div>
    <?php endif; ?>
</body>
</html>