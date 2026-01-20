<?php
/**
 * Email Sending Endpoint
 * Fallback for Supabase Edge Functions
 */

require_once __DIR__ . '/config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

// Get request body
$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody, true);

if (!$body) {
    errorResponse('Invalid JSON body', 400);
}

// Validate required fields
$type = $body['type'] ?? null;
$to = $body['to'] ?? null;

if (!$type || !$to) {
    errorResponse('Missing required fields: type, to', 400);
}

// Validate email
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    errorResponse('Invalid email address', 400);
}

// Get RESEND_API_KEY from environment
$resendApiKey = getenv('RESEND_API_KEY');
if (!$resendApiKey) {
    errorResponse('Email service not configured', 500);
}

// Build email based on type
$emailData = [];

switch ($type) {
    case 'welcome':
        $name = $body['name'] ?? 'User';
        $planName = $body['planName'] ?? 'Starter';
        $trialEndsAt = $body['trialEndsAt'] ?? date('Y-m-d', strtotime('+7 days'));
        
        $emailData = [
            'from' => 'TorqueNinja <noreply@torquesticker.com>',
            'to' => [$to],
            'subject' => 'Welcome to TorqueNinja!',
            'html' => buildWelcomeEmail($name, $planName, $trialEndsAt)
        ];
        break;
        
    case 'verification':
        $confirmationUrl = $body['confirmationUrl'] ?? '';
        if (!$confirmationUrl) {
            errorResponse('Missing confirmationUrl', 400);
        }
        
        $emailData = [
            'from' => 'TorqueNinja <noreply@torquesticker.com>',
            'to' => [$to],
            'subject' => 'Verify Your Email - TorqueNinja',
            'html' => buildVerificationEmail($confirmationUrl)
        ];
        break;
        
    case 'invoice':
        $invoiceNumber = $body['invoiceNumber'] ?? '';
        $amount = $body['amount'] ?? 0;
        $dueDate = $body['dueDate'] ?? '';
        $clientName = $body['clientName'] ?? '';
        
        $emailData = [
            'from' => 'TorqueNinja <noreply@torquesticker.com>',
            'to' => [$to],
            'subject' => "Invoice {$invoiceNumber} from TorqueNinja",
            'html' => buildInvoiceEmail($invoiceNumber, $amount, $dueDate, $clientName)
        ];
        break;
        
    case 'password_reset':
        $resetUrl = $body['resetUrl'] ?? '';
        if (!$resetUrl) {
            errorResponse('Missing resetUrl', 400);
        }
        
        $emailData = [
            'from' => 'TorqueNinja <noreply@torquesticker.com>',
            'to' => [$to],
            'subject' => 'Reset Your Password - TorqueNinja',
            'html' => buildPasswordResetEmail($resetUrl)
        ];
        break;
        
    default:
        errorResponse('Unknown email type', 400);
}

// Send email via Resend API
$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $resendApiKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailData));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    logActivity('email_error', ['error' => $error, 'to' => $to, 'type' => $type]);
    errorResponse('Failed to send email', 500, $error);
}

$result = json_decode($response, true);

if ($httpCode >= 400) {
    logActivity('email_error', ['response' => $result, 'to' => $to, 'type' => $type]);
    errorResponse($result['message'] ?? 'Email sending failed', $httpCode);
}

logActivity('email_sent', ['to' => $to, 'type' => $type, 'id' => $result['id'] ?? null]);
jsonResponse(['success' => true, 'id' => $result['id'] ?? null]);

// Email template functions
function buildWelcomeEmail($name, $planName, $trialEndsAt) {
    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .button { display: inline-block; padding: 12px 24px; background: #FF5722; color: white; text-decoration: none; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to TorqueNinja, {$name}!</h1>
        </div>
        <p>Thank you for signing up for the <strong>{$planName}</strong> plan.</p>
        <p>Your 7-day free trial has started and will end on <strong>{$trialEndsAt}</strong>.</p>
        <p>Get started by:</p>
        <ul>
            <li>Adding your first client</li>
            <li>Creating your product catalog</li>
            <li>Generating your first invoice</li>
        </ul>
        <p style="text-align: center; margin-top: 30px;">
            <a href="https://cms.torquesticker.com/dashboard" class="button">Go to Dashboard</a>
        </p>
        <p style="margin-top: 40px; color: #666; font-size: 14px;">
            If you have any questions, reply to this email or contact us at support@torqueninja.com
        </p>
    </div>
</body>
</html>
HTML;
}

function buildVerificationEmail($confirmationUrl) {
    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #FF5722; color: white; text-decoration: none; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verify Your Email</h1>
        <p>Please click the button below to verify your email address:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{$confirmationUrl}" class="button">Verify Email</a>
        </p>
        <p style="color: #666; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
HTML;
}

function buildInvoiceEmail($invoiceNumber, $amount, $dueDate, $clientName) {
    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .amount { font-size: 32px; font-weight: bold; color: #FF5722; }
        .button { display: inline-block; padding: 12px 24px; background: #FF5722; color: white; text-decoration: none; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Invoice {$invoiceNumber}</h1>
        <p>Dear {$clientName},</p>
        <p>Please find your invoice attached. Here are the details:</p>
        <p class="amount">৳{$amount}</p>
        <p><strong>Due Date:</strong> {$dueDate}</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="https://cms.torquesticker.com/client-portal" class="button">View Invoice</a>
        </p>
        <p style="color: #666; font-size: 14px;">
            Thank you for your business!
        </p>
    </div>
</body>
</html>
HTML;
}

function buildPasswordResetEmail($resetUrl) {
    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #FF5722; color: white; text-decoration: none; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{$resetUrl}" class="button">Reset Password</a>
        </p>
        <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
HTML;
}
