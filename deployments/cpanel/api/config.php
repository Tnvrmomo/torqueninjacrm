<?php
/**
 * TorqueNinja PHP Configuration
 * Fallback API for cPanel deployment
 * 
 * This file provides PHP-based fallback functionality for environments
 * where Supabase Edge Functions may not be directly accessible.
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../logs/php-errors.log');

// Environment configuration
define('ENVIRONMENT', getenv('ENVIRONMENT') ?: 'production');
define('DEBUG_MODE', ENVIRONMENT !== 'production');

// Supabase configuration
define('SUPABASE_URL', getenv('VITE_SUPABASE_URL') ?: 'https://krphkpliaoitytorrpcv.supabase.co');
define('SUPABASE_ANON_KEY', getenv('VITE_SUPABASE_PUBLISHABLE_KEY') ?: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycGhrcGxpYW9pdHl0b3JycGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjQ5NzUsImV4cCI6MjA3OTUwMDk3NX0.U4EyUXC6DMf6vnl_H1l9NAvmhWpXfu2OtmCe0bXv2Kg');

// Application configuration
define('APP_NAME', 'TorqueNinja');
define('APP_VERSION', '1.0.0');
define('BASE_URL', 'https://cms.torquesticker.com');

// Security settings
define('BCRYPT_COST', 12);
define('TOKEN_EXPIRY', 86400); // 24 hours

/**
 * Helper function to send JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Helper function to send error response
 */
function errorResponse($message, $statusCode = 400, $details = null) {
    $response = ['error' => $message];
    if (DEBUG_MODE && $details) {
        $response['details'] = $details;
    }
    jsonResponse($response, $statusCode);
}

/**
 * Validate authorization header
 */
function validateAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    
    if (!$authHeader) {
        errorResponse('Authorization header required', 401);
    }
    
    $token = str_replace('Bearer ', '', $authHeader);
    return $token;
}

/**
 * Make request to Supabase
 */
function supabaseRequest($endpoint, $method = 'GET', $data = null, $token = null) {
    $url = SUPABASE_URL . $endpoint;
    
    $headers = [
        'apikey: ' . SUPABASE_ANON_KEY,
        'Content-Type: application/json',
    ];
    
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    } else {
        $headers[] = 'Authorization: Bearer ' . SUPABASE_ANON_KEY;
    }
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error, 'status' => 500];
    }
    
    return [
        'data' => json_decode($response, true),
        'status' => $httpCode
    ];
}

/**
 * Log activity
 */
function logActivity($action, $details = []) {
    $logFile = __DIR__ . '/../logs/activity.log';
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'action' => $action,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'details' => $details
    ];
    
    @file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
}
