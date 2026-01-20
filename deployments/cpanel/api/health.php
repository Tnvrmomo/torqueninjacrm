<?php
/**
 * Health Check Endpoint
 * Returns system status for monitoring
 */

require_once __DIR__ . '/config.php';

// Check Supabase connectivity
$supabaseStatus = 'unknown';
$supabaseResult = supabaseRequest('/rest/v1/', 'GET');
if ($supabaseResult['status'] >= 200 && $supabaseResult['status'] < 300) {
    $supabaseStatus = 'connected';
} else {
    $supabaseStatus = 'error';
}

// Check PHP version
$phpVersion = PHP_VERSION;
$phpOk = version_compare($phpVersion, '8.0.0', '>=');

// Check required extensions
$requiredExtensions = ['curl', 'json', 'mbstring', 'openssl'];
$missingExtensions = [];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}

// Check log directory
$logDir = __DIR__ . '/../logs';
$logsWritable = is_dir($logDir) && is_writable($logDir);

// Build response
$health = [
    'status' => 'healthy',
    'timestamp' => date('c'),
    'version' => APP_VERSION,
    'environment' => ENVIRONMENT,
    'checks' => [
        'php' => [
            'status' => $phpOk ? 'ok' : 'warning',
            'version' => $phpVersion,
            'required' => '8.0.0'
        ],
        'extensions' => [
            'status' => empty($missingExtensions) ? 'ok' : 'error',
            'missing' => $missingExtensions
        ],
        'supabase' => [
            'status' => $supabaseStatus,
            'url' => SUPABASE_URL
        ],
        'logs' => [
            'status' => $logsWritable ? 'ok' : 'warning',
            'writable' => $logsWritable
        ]
    ]
];

// Determine overall status
if ($supabaseStatus === 'error' || !empty($missingExtensions)) {
    $health['status'] = 'unhealthy';
} elseif (!$phpOk || !$logsWritable) {
    $health['status'] = 'degraded';
}

jsonResponse($health);
