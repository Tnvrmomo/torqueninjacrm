-- Create subscription plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_bdt NUMERIC NOT NULL,
  price_usd NUMERIC NOT NULL,
  is_one_time BOOLEAN DEFAULT FALSE,
  features JSONB,
  ai_queries_limit INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company subscriptions table
CREATE TABLE company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  status TEXT DEFAULT 'active',
  payment_method TEXT,
  currency TEXT DEFAULT 'BDT',
  amount_paid NUMERIC,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI usage tracking table
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_type TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_bdt NUMERIC DEFAULT 0,
  cost_usd NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES company_subscriptions(id) ON DELETE SET NULL,
  amount_bdt NUMERIC,
  amount_usd NUMERIC,
  currency TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_gateway_id TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dashboard customization table
CREATE TABLE dashboard_customization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE NOT NULL,
  visible_modules JSONB DEFAULT '["inventory", "quotes", "invoices", "clients", "vendors", "analytics"]',
  theme_settings JSONB DEFAULT '{}',
  widget_layout JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_customization ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (true);

-- RLS Policies for company_subscriptions
CREATE POLICY "Users can view their company subscription"
  ON company_subscriptions FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their company subscription"
  ON company_subscriptions FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their company subscription"
  ON company_subscriptions FOR UPDATE
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for ai_usage
CREATE POLICY "Users can view their company AI usage"
  ON ai_usage FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their company AI usage"
  ON ai_usage FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their company payment transactions"
  ON payment_transactions FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their company payment transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for dashboard_customization
CREATE POLICY "Users can view their company dashboard settings"
  ON dashboard_customization FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their company dashboard settings"
  ON dashboard_customization FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their company dashboard settings"
  ON dashboard_customization FOR UPDATE
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_bdt, price_usd, is_one_time, features, ai_queries_limit) VALUES
('Starter', 'Perfect for small businesses', 2500, 25, FALSE, '{"products_limit": 100, "invoices_limit": 50, "quotes_limit": 25, "basic_analytics": true}', 0),
('Professional', 'For growing businesses', 5000, 50, FALSE, '{"products_limit": null, "invoices_limit": null, "quotes_limit": null, "advanced_analytics": true, "smart_notifications": true}', 1000),
('Lifetime', 'Pay once, use forever', 10000, 100, TRUE, '{"products_limit": null, "invoices_limit": null, "quotes_limit": null, "advanced_analytics": true, "smart_notifications": true, "unlimited_ai": true}', null);

-- Update handle_new_user function to create default subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  default_company_id UUID;
  starter_plan_id UUID;
BEGIN
  -- Create a default company for the new user
  INSERT INTO public.companies (name, legal_name)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Company'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Company')
  )
  RETURNING id INTO default_company_id;

  -- Create profile for the new user
  INSERT INTO public.profiles (user_id, company_id, name, email, role)
  VALUES (
    NEW.id,
    default_company_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'admin'
  );

  -- Assign admin role to new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');

  -- Get starter plan ID
  SELECT id INTO starter_plan_id FROM public.subscription_plans WHERE name = 'Starter' LIMIT 1;

  -- Create default trial subscription (7 days)
  INSERT INTO public.company_subscriptions (company_id, plan_id, status, currency, trial_ends_at, current_period_start, current_period_end)
  VALUES (
    default_company_id,
    starter_plan_id,
    'trial',
    'BDT',
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW() + INTERVAL '7 days'
  );

  -- Create default dashboard customization
  INSERT INTO public.dashboard_customization (company_id)
  VALUES (default_company_id);

  RETURN NEW;
END;
$function$;

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_subscriptions_updated_at
  BEFORE UPDATE ON company_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();

CREATE TRIGGER update_dashboard_customization_updated_at
  BEFORE UPDATE ON dashboard_customization
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();