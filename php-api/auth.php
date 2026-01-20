<?php
// auth.php - Authentication endpoints

require_once 'config.php';
require_once 'jwt.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

if ($method === 'POST' && strpos($path, '/auth/signin') !== false) {
    signIn();
} elseif ($method === 'POST' && strpos($path, '/auth/signup') !== false) {
    signUp();
} elseif ($method === 'GET' && strpos($path, '/auth/user') !== false) {
    getUser();
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}

function signIn() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        return;
    }

    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT user_id, name, email, role, password_hash FROM profiles WHERE email = ?");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($input['password'], $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }

    $payload = [
        'user_id' => $user['user_id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];

    $token = JWT::encode($payload, JWT_SECRET);

    echo json_encode([
        'data' => [
            'user' => [
                'id' => $user['user_id'],
                'email' => $user['email'],
                'user_metadata' => ['full_name' => $user['name']]
            ],
            'session' => ['access_token' => $token]
        ]
    ]);
}

function signUp() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        return;
    }

    $pdo = getDB();

    // Check if user exists
    $stmt = $pdo->prepare("SELECT user_id FROM profiles WHERE email = ?");
    $stmt->execute([$input['email']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'User already exists']);
        return;
    }

    // Create company
    $company_id = uniqid('comp_', true);
    $stmt = $pdo->prepare("INSERT INTO companies (id, name, legal_name) VALUES (?, ?, ?)");
    $stmt->execute([$company_id, $input['full_name'] ?? 'My Company', $input['full_name'] ?? 'My Company']);

    // Create user
    $user_id = uniqid('user_', true);
    $password_hash = password_hash($input['password'], PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO profiles (user_id, company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'admin')");
    $stmt->execute([$user_id, $company_id, $input['full_name'] ?? 'User', $input['email'], $password_hash]);

    // Create role
    $stmt = $pdo->prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'admin')");
    $stmt->execute([$user_id]);

    $payload = [
        'user_id' => $user_id,
        'email' => $input['email'],
        'name' => $input['full_name'] ?? 'User',
        'role' => 'admin',
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60)
    ];

    $token = JWT::encode($payload, JWT_SECRET);

    echo json_encode([
        'data' => [
            'user' => [
                'id' => $user_id,
                'email' => $input['email'],
                'user_metadata' => ['full_name' => $input['full_name'] ?? 'User']
            ],
            'session' => ['access_token' => $token]
        ]
    ]);
}

function getUser() {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer (.+)/', $auth_header, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        return;
    }

    $token = $matches[1];
    $payload = JWT::decode($token, JWT_SECRET);

    if (!$payload || ($payload['exp'] ?? 0) < time()) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        return;
    }

    echo json_encode([
        'data' => [
            'user' => [
                'id' => $payload['user_id'],
                'email' => $payload['email'],
                'user_metadata' => ['full_name' => $payload['name']]
            ]
        ]
    ]);
}
?>