<?php
/**
 * TorqueNinja API Router
 * Main entry point for PHP fallback API
 */

require_once __DIR__ . '/config.php';

$path = $_GET['action'] ?? $_SERVER['PATH_INFO'] ?? '';
$path = trim($path, '/');

switch ($path) {
    case 'health':
        require __DIR__ . '/health.php';
        break;
    case 'proxy':
        require __DIR__ . '/proxy.php';
        break;
    case 'email':
        require __DIR__ . '/email.php';
        break;
    default:
        jsonResponse([
            'name' => APP_NAME,
            'version' => APP_VERSION,
            'status' => 'running',
            'endpoints' => [
                'GET /api/?action=health' => 'System health check',
                'GET /api/?action=proxy&path=/rest/v1/...' => 'Supabase proxy',
                'POST /api/?action=email' => 'Send emails'
            ]
        ]);
}
