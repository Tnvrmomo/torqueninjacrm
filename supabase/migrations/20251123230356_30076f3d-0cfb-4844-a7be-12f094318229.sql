-- Phase 1.1: Clean up duplicate roles
-- Remove duplicate 'user' role from super admin
DELETE FROM user_roles 
WHERE user_id = '7c9609d2-3801-4942-a900-55faf026f1e9' 
AND role = 'user';

-- Phase 1.2: Fix orphaned users
DO $$
DECLARE
  v_demo_user_id uuid := '5bc8cc09-b395-48f2-8315-98859b0d6ab0';
  v_kptjms_user_id uuid := '74c0af9d-971f-4d93-8b93-0799dfcda045';
  v_demo_company_id uuid;
  v_kptjms_company_id uuid;
  v_starter_plan_id uuid;
BEGIN
  -- Get starter plan ID
  SELECT id INTO v_starter_plan_id 
  FROM subscription_plans 
  WHERE name = 'Starter' 
  LIMIT 1;

  -- Fix demo@torqueninja.com
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = v_demo_user_id) THEN
    INSERT INTO companies (name, legal_name, currency)
    VALUES ('Demo Company', 'Demo Company', 'BDT')
    RETURNING id INTO v_demo_company_id;
    
    INSERT INTO profiles (user_id, company_id, name, email, role)
    VALUES (v_demo_user_id, v_demo_company_id, 'Demo User', 'demo@torqueninja.com', 'user');
    
    INSERT INTO user_roles (user_id, role)
    VALUES (v_demo_user_id, 'user');
    
    INSERT INTO company_subscriptions (company_id, plan_id, status, currency, trial_ends_at, current_period_start, current_period_end)
    VALUES (v_demo_company_id, v_starter_plan_id, 'trial', 'BDT', NOW() + INTERVAL '30 days', NOW(), NOW() + INTERVAL '30 days');
    
    INSERT INTO dashboard_customization (company_id)
    VALUES (v_demo_company_id);
  END IF;

  -- Fix kptjms991@gmail.com
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = v_kptjms_user_id) THEN
    INSERT INTO companies (name, legal_name, currency)
    VALUES ('KPTJMS Company', 'KPTJMS Company', 'BDT')
    RETURNING id INTO v_kptjms_company_id;
    
    INSERT INTO profiles (user_id, company_id, name, email, role)
    VALUES (v_kptjms_user_id, v_kptjms_company_id, 'User', 'kptjms991@gmail.com', 'user');
    
    INSERT INTO user_roles (user_id, role)
    VALUES (v_kptjms_user_id, 'user');
    
    INSERT INTO company_subscriptions (company_id, plan_id, status, currency, trial_ends_at, current_period_start, current_period_end)
    VALUES (v_kptjms_company_id, v_starter_plan_id, 'trial', 'BDT', NOW() + INTERVAL '7 days', NOW(), NOW() + INTERVAL '7 days');
    
    INSERT INTO dashboard_customization (company_id)
    VALUES (v_kptjms_company_id);
  END IF;
END $$;

-- Phase 1.4: Update handle_new_user() trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_company_id UUID;
  starter_plan_id UUID;
  selected_plan_id UUID;
  user_currency TEXT;
BEGIN
  -- Get selected plan from metadata, default to Starter
  selected_plan_id := (NEW.raw_user_meta_data->>'selected_plan')::UUID;
  user_currency := COALESCE(NEW.raw_user_meta_data->>'currency', 'BDT');
  
  -- If no plan selected or invalid, get Starter plan
  IF selected_plan_id IS NULL THEN
    SELECT id INTO starter_plan_id 
    FROM public.subscription_plans 
    WHERE name = 'Starter' 
    LIMIT 1;
    selected_plan_id := starter_plan_id;
  END IF;

  -- Create company
  INSERT INTO public.companies (name, legal_name, currency)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Company'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Company'),
    user_currency
  )
  RETURNING id INTO default_company_id;

  -- Create profile
  INSERT INTO public.profiles (user_id, company_id, name, email, role)
  VALUES (
    NEW.id,
    default_company_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'user'
  );

  -- Assign user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Create trial subscription
  INSERT INTO public.company_subscriptions (
    company_id, 
    plan_id, 
    status, 
    currency, 
    trial_ends_at, 
    current_period_start, 
    current_period_end
  )
  VALUES (
    default_company_id,
    selected_plan_id,
    'trial',
    user_currency,
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW() + INTERVAL '7 days'
  );

  -- Create dashboard customization
  INSERT INTO public.dashboard_customization (company_id)
  VALUES (default_company_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();