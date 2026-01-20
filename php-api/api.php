<?php
// api.php - Generic API endpoints for tables

require_once 'config.php';
require_once 'jwt.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Extract table name from path, e.g., /api/clients
if (preg_match('/\/api\/([^\/]+)/', $path, $matches)) {
    $table = $matches[1];
    handleTableRequest($table, $method);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}

function handleTableRequest($table, $method) {
    // Authenticate user
    $user = authenticateUser();
    if (!$user) {
        return;
    }

    $pdo = getDB();

    // Get company_id from user
    $stmt = $pdo->prepare("SELECT company_id FROM profiles WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);
    $profile = $stmt->fetch();
    $company_id = $profile['company_id'];

    switch ($method) {
        case 'GET':
            handleSelect($pdo, $table, $company_id);
            break;
        case 'POST':
            handleInsert($pdo, $table, $company_id);
            break;
        case 'PUT':
            handleUpdate($pdo, $table, $company_id);
            break;
        case 'DELETE':
            handleDelete($pdo, $table, $company_id);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function authenticateUser() {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer (.+)/', $auth_header, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        return false;
    }

    $token = $matches[1];
    $payload = JWT::decode($token, JWT_SECRET);

    if (!$payload || ($payload['exp'] ?? 0) < time()) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        return false;
    }

    return $payload;
}

function handleSelect($pdo, $table, $company_id) {
    $query = $_GET['query'] ?? '';
    $eq = $_GET['eq'] ?? '';
    $single = isset($_GET['single']);

    // Parse query parameters
    $where = [];
    $params = [];

    if ($eq) {
        list($column, $value) = explode(',', $eq, 2);
        $where[] = "$column = ?";
        $params[] = $value;
    }

    // Add company filter for relevant tables
    $company_tables = ['clients', 'invoices', 'quotes', 'expenses', 'products', 'payments', 'activity_log'];
    if (in_array($table, $company_tables)) {
        $where[] = "company_id = ?";
        $params[] = $company_id;
    }

    $where_clause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $order = isset($_GET['order']) ? 'ORDER BY ' . $_GET['order'] : '';

    $sql = "SELECT * FROM $table $where_clause $order";

    if ($single) {
        $sql .= ' LIMIT 1';
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $data = $single ? $stmt->fetch() : $stmt->fetchAll();

    echo json_encode(['data' => $data]);
}

function handleInsert($pdo, $table, $company_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        return;
    }

    // Add company_id for relevant tables
    $company_tables = ['clients', 'invoices', 'quotes', 'expenses', 'products', 'payments', 'activity_log'];
    if (in_array($table, $company_tables)) {
        $input['company_id'] = $company_id;
    }

    $columns = array_keys($input);
    $placeholders = str_repeat('?,', count($columns) - 1) . '?';
    $sql = "INSERT INTO $table (" . implode(',', $columns) . ") VALUES ($placeholders)";

    $stmt = $pdo->prepare($sql);
    if ($stmt->execute(array_values($input))) {
        echo json_encode(['data' => ['id' => $pdo->lastInsertId()]]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Insert failed']);
    }
}

function handleUpdate($pdo, $table, $company_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        return;
    }

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID required']);
        return;
    }

    unset($input['id']); // Don't update id

    $sets = [];
    $params = [];
    foreach ($input as $key => $value) {
        $sets[] = "$key = ?";
        $params[] = $value;
    }
    $params[] = $id;

    $sql = "UPDATE $table SET " . implode(',', $sets) . " WHERE id = ?";

    // Add company check for relevant tables
    $company_tables = ['clients', 'invoices', 'quotes', 'expenses', 'products', 'payments'];
    if (in_array($table, $company_tables)) {
        $sql .= " AND company_id = ?";
        $params[] = $company_id;
    }

    $stmt = $pdo->prepare($sql);
    if ($stmt->execute($params)) {
        echo json_encode(['data' => null]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Update failed']);
    }
}

function handleDelete($pdo, $table, $company_id) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID required']);
        return;
    }

    $sql = "DELETE FROM $table WHERE id = ?";

    // Add company check for relevant tables
    $company_tables = ['clients', 'invoices', 'quotes', 'expenses', 'products', 'payments'];
    if (in_array($table, $company_tables)) {
        $sql .= " AND company_id = ?";
        $params = [$id, $company_id];
    } else {
        $params = [$id];
    }

    $stmt = $pdo->prepare($sql);
    if ($stmt->execute($params)) {
        echo json_encode(['data' => null]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Delete failed']);
    }
}
?>