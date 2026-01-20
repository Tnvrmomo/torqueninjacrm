<?php
// index.php - Main entry point

$path = $_SERVER['REQUEST_URI'];

// Route to appropriate handler
if (strpos($path, '/auth/') === 0) {
    require_once 'auth.php';
} elseif (strpos($path, '/api/') === 0) {
    require_once 'api.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?>