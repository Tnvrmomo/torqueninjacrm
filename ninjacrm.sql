-- NinjaCRM MySQL Database Setup
-- Import this file into PHPMyAdmin after creating the database
-- Create database (run this separately if needed)
-- CREATE DATABASE torquest_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE torquest_cms;

-- Enable UUID extension (MySQL 8.0+)
-- If not available, use CHAR(36) for UUIDs

-- Create companies table
CREATE TABLE companies (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    tax_id VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'BDT',
    timezone VARCHAR(50) DEFAULT 'Asia/Dhaka',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE profiles (
    user_id CHAR(36) PRIMARY KEY,
    company_id CHAR(36),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('admin', 'user', 'moderator') DEFAULT 'user',
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    password_hash VARCHAR(255),  -- Add password hash for auth
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create user_roles table
CREATE TABLE user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    role ENUM('admin', 'moderator', 'user') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_role (user_id, role),
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- Create clients table
CREATE TABLE clients (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36),
    client_number VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    vat_number VARCHAR(100),
    id_number VARCHAR(100),
    street TEXT,
    apt_suite TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'People\'s Republic of Bangladesh',
    shipping_street TEXT,
    shipping_apt_suite TEXT,
    shipping_city VARCHAR(100),
    shipping_state_province VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    balance DECIMAL(15,2) DEFAULT 0,
    paid_to_date DECIMAL(15,2) DEFAULT 0,
    payment_balance DECIMAL(15,2) DEFAULT 0,
    credit_balance DECIMAL(15,2) DEFAULT 0,
    credit_limit DECIMAL(15,2),
    payment_terms VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'BDT',
    contact_first_name VARCHAR(100),
    contact_last_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create products table
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2),
    cost DECIMAL(15,2),
    sku VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create invoices table
CREATE TABLE invoices (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36),
    client_id CHAR(36),
    invoice_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft',
    issue_date DATE,
    due_date DATE,
    subtotal DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    discount_amount DECIMAL(15,2),
    total DECIMAL(15,2),
    notes TEXT,
    currency VARCHAR(10) DEFAULT 'BDT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Create invoice_items table
CREATE TABLE invoice_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_id CHAR(36),
    product_id CHAR(36),
    description TEXT,
    quantity DECIMAL(10,2),
    unit_price DECIMAL(15,2),
    tax_rate DECIMAL(5,2),
    discount_amount DECIMAL(15,2),
    total DECIMAL(15,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Create quotes table
CREATE TABLE quotes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36),
    client_id CHAR(36),
    quote_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft',
    issue_date DATE,
    expiry_date DATE,
    subtotal DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    discount_amount DECIMAL(15,2),
    total DECIMAL(15,2),
    notes TEXT,
    currency VARCHAR(10) DEFAULT 'BDT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Create quote_items table
CREATE TABLE quote_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    quote_id CHAR(36),
    product_id CHAR(36),
    description TEXT,
    quantity DECIMAL(10,2),
    unit_price DECIMAL(15,2),
    tax_rate DECIMAL(5,2),
    discount_amount DECIMAL(15,2),
    total DECIMAL(15,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Create expenses table
CREATE TABLE expenses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36),
    category VARCHAR(100),
    amount DECIMAL(15,2),
    description TEXT,
    expense_date DATE,
    vendor VARCHAR(255),
    receipt_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36),
    client_id CHAR(36),
    invoice_id CHAR(36),
    amount DECIMAL(15,2),
    payment_date DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

-- Create activity_log table
CREATE TABLE activity_log (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36),
    user_id CHAR(36),
    activity_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    activity TEXT NOT NULL,
    ip_address VARCHAR(45),
    entity_type VARCHAR(50),
    entity_id CHAR(36),
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Insert default company
INSERT INTO companies (id, name, legal_name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'NinjaCRM', 'NinjaCRM Inc.');

-- Insert admin user profile
INSERT INTO profiles (user_id, company_id, name, email, role, password_hash) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Super Admin', 'admin@ninjacrm.com', 'admin', '$2b$10$abcdefghijklmnopqrstuv1234567890');

-- Insert admin role
INSERT INTO user_roles (user_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'admin');

-- Note: Password hashing should be done in PHP
-- For MySQL auth, you need to implement your own auth system
-- The password 'admin1234' hashed with bcrypt would be: $2b$10$example.hash.here
-- But since this is a simple setup, you'll need to handle auth in your PHP API

-- Add more tables as needed from the Supabase schema
-- This is a minimal setup for the admin user