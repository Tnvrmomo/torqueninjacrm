-- Phase 1b: Create Super Admin Infrastructure & Fix Security Issues

-- 1. Create super_admin company (platform management company)
INSERT INTO companies (id, name, legal_name, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'TorqueNinja Platform',
  'TorqueNinja Platform Administration',
  'torquestickers@gmail.com'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Super Admin subscription plan
INSERT INTO subscription_plans (id, name, description, price_bdt, price_usd, is_one_time, features, ai_queries_limit)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Super Admin',
  'Platform administration with unlimited access',
  0,
  0,
  true,
  '{"products_limit": null, "invoices_limit": null, "quotes_limit": null, "unlimited_everything": true, "platform_admin": true}'::jsonb,
  null
) ON CONFLICT (id) DO NOTHING;

-- 3. Create super admin profile
INSERT INTO profiles (user_id, company_id, name, email, role)
VALUES (
  '7c9609d2-3801-4942-a900-55faf026f1e9',
  '00000000-0000-0000-0000-000000000001',
  'Super Admin',
  'torquestickers@gmail.com',
  'admin'
) ON CONFLICT (user_id) DO NOTHING;

-- 4. Assign super_admin role
INSERT INTO user_roles (user_id, role)
VALUES (
  '7c9609d2-3801-4942-a900-55faf026f1e9',
  'super_admin'
) ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Create permanent active subscription for super admin
INSERT INTO company_subscriptions (
  company_id, 
  plan_id, 
  status, 
  currency, 
  current_period_start, 
  current_period_end
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'active',
  'USD',
  NOW(),
  NOW() + INTERVAL '100 years'
) ON CONFLICT DO NOTHING;

-- 6. Create platform_settings table for global settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can manage platform settings"
ON platform_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Insert default payment gateway settings
INSERT INTO platform_settings (setting_key, category, setting_value, description) VALUES
('stripe_secret_key', 'payment_gateway', '{"key": "", "webhook_secret": ""}'::jsonb, 'Stripe API credentials'),
('sslcommerz_credentials', 'payment_gateway', '{"store_id": "", "store_password": ""}'::jsonb, 'SSLCommerz credentials'),
('bkash_credentials', 'payment_gateway', '{"app_key": "", "app_secret": ""}'::jsonb, 'bKash credentials'),
('nagad_credentials', 'payment_gateway', '{"merchant_id": "", "merchant_key": ""}'::jsonb, 'Nagad credentials'),
('rocket_credentials', 'payment_gateway', '{"merchant_id": "", "merchant_key": ""}'::jsonb, 'Rocket credentials')
ON CONFLICT (setting_key) DO NOTHING;

-- 7. Create custom_domains table
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  ssl_status TEXT DEFAULT 'pending',
  dns_records JSONB,
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company domain"
ON custom_domains FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can request domain for their company"
ON custom_domains FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can manage all domains"
ON custom_domains FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- 8. Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target_entity_type TEXT,
  target_entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can view audit logs"
ON admin_audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can insert audit logs"
ON admin_audit_log FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- 9. Add super admin bypass policies to all tables

-- Profiles
CREATE POLICY "Super admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Clients
CREATE POLICY "Super admins can view all clients"
ON clients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage all clients"
ON clients FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Invoices
CREATE POLICY "Super admins can view all invoices"
ON invoices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage all invoices"
ON invoices FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Products
CREATE POLICY "Super admins can view all products"
ON products FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Quotes
CREATE POLICY "Super admins can view all quotes"
ON quotes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Payments
CREATE POLICY "Super admins can view all payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Company subscriptions
CREATE POLICY "Super admins can view all subscriptions"
ON company_subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update all subscriptions"
ON company_subscriptions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Companies
CREATE POLICY "Super admins can view all companies"
ON companies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Notifications
CREATE POLICY "Super admins can view all notifications"
ON notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);