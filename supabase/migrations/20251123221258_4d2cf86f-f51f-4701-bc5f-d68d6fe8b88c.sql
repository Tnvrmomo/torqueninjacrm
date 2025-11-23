-- Fix handle_new_user function to assign 'user' role instead of 'admin'
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

  -- Create profile for the new user with 'user' role (not admin)
  INSERT INTO public.profiles (user_id, company_id, name, email, role)
  VALUES (
    NEW.id,
    default_company_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'user'  -- Changed from 'admin' to 'user'
  );

  -- Assign user role to new user (not admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');  -- Changed from 'admin' to 'user'

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

-- Clean up existing incorrect admin roles
-- Keep super_admin for torquestickers@gmail.com, remove admin from regular users
DELETE FROM public.user_roles
WHERE role = 'admin'
AND user_id NOT IN (
  SELECT user_id FROM public.profiles WHERE email = 'torquestickers@gmail.com'
);

-- Ensure all users have the 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT p.user_id, 'user'::app_role
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.user_id AND ur.role = 'user'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Update profiles table to set role to 'user' for non-super-admin users
UPDATE public.profiles
SET role = 'user'
WHERE email != 'torquestickers@gmail.com'
AND role = 'admin';