<?php
/**
 * Supabase Proxy Endpoint
 * Routes requests to Supabase for environments with CORS issues
 */

require_once __DIR__ . '/config.php';

// Get request details
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';
$token = null;

// Extract token if provided
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
if ($authHeader) {
    $token = str_replace('Bearer ', '', $authHeader);
}

// Validate path
if (empty($path)) {
    errorResponse('Path parameter required', 400);
}

// Sanitize path - only allow specific patterns
$allowedPaths = [
    '/rest/v1/',
    '/auth/v1/',
    '/storage/v1/'
];

$validPath = false;
foreach ($allowedPaths as $allowed) {
    if (strpos($path, $allowed) === 0) {
        $validPath = true;
        break;
    }
}

if (!$validPath) {
    errorResponse('Invalid path', 403);
}

// Get request body for POST/PUT/PATCH
$body = null;
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $rawBody = file_get_contents('php://input');
    if ($rawBody) {
        $body = json_decode($rawBody, true);
    }
}

// Forward request to Supabase
$result = supabaseRequest($path, $method, $body, $token);

// Log the request (for debugging)
if (DEBUG_MODE) {
    logActivity('proxy_request', [
        'path' => $path,
        'method' => $method,
        'status' => $result['status']
    ]);
}

// Return response
http_response_code($result['status']);
echo json_encode($result['data']);
