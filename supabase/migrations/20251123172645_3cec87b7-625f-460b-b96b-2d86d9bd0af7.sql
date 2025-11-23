-- Fix security warnings by setting search_path for functions

-- Replace update_updated_at_column with proper security
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Replace handle_new_user with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_company_id UUID;
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;