-- Security Enhancement: Add database-level validation constraints
-- This implements server-side validation to prevent bypassing client-side checks

-- Add email format validation to clients table
ALTER TABLE public.clients 
ADD CONSTRAINT clients_email_format CHECK (
  email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

ALTER TABLE public.clients 
ADD CONSTRAINT clients_contact_email_format CHECK (
  contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Add URL format validation to clients table
ALTER TABLE public.clients 
ADD CONSTRAINT clients_website_format CHECK (
  website IS NULL OR website ~* '^https?://'
);

-- Add phone format validation
ALTER TABLE public.clients 
ADD CONSTRAINT clients_phone_format CHECK (
  phone IS NULL OR phone ~* '^[\d\s\-\+\(\)]+$'
);

ALTER TABLE public.clients 
ADD CONSTRAINT clients_contact_phone_format CHECK (
  contact_phone IS NULL OR contact_phone ~* '^[\d\s\-\+\(\)]+$'
);

-- Add length constraints to prevent excessive data
ALTER TABLE public.clients 
ADD CONSTRAINT clients_name_length CHECK (length(name) <= 255);

ALTER TABLE public.clients 
ADD CONSTRAINT clients_email_length CHECK (email IS NULL OR length(email) <= 255);

ALTER TABLE public.clients 
ADD CONSTRAINT clients_website_length CHECK (website IS NULL OR length(website) <= 500);

-- Add email validation to profiles table
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_format CHECK (
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_length CHECK (length(email) <= 255);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_name_length CHECK (length(name) <= 255);

-- Add email validation to companies table
ALTER TABLE public.companies 
ADD CONSTRAINT companies_email_format CHECK (
  email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

ALTER TABLE public.companies 
ADD CONSTRAINT companies_website_format CHECK (
  website IS NULL OR website ~* '^https?://'
);

ALTER TABLE public.companies 
ADD CONSTRAINT companies_name_length CHECK (length(name) <= 255);

-- Add validation to products table
ALTER TABLE public.products 
ADD CONSTRAINT products_name_length CHECK (length(name) <= 255);

ALTER TABLE public.products 
ADD CONSTRAINT products_sale_price_positive CHECK (sale_price >= 0);

ALTER TABLE public.products 
ADD CONSTRAINT products_cost_price_positive CHECK (cost_price IS NULL OR cost_price >= 0);

-- Add validation to webhooks table
ALTER TABLE public.webhooks 
ADD CONSTRAINT webhooks_name_length CHECK (length(name) <= 255);

ALTER TABLE public.webhooks 
ADD CONSTRAINT webhooks_url_format CHECK (url ~* '^https?://');

ALTER TABLE public.webhooks 
ADD CONSTRAINT webhooks_url_length CHECK (length(url) <= 2000);

-- Add validation to api_keys table
ALTER TABLE public.api_keys 
ADD CONSTRAINT api_keys_name_length CHECK (length(name) <= 255);

-- Clean up redundant RLS policies (remove auth-only checks, keep company-scoped)
-- These policies are redundant because company-scoped policies are more restrictive

DROP POLICY IF EXISTS "Users must be authenticated to view activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users must be authenticated to view AI usage" ON public.ai_usage;
DROP POLICY IF EXISTS "Users must be authenticated to view clients" ON public.clients;
DROP POLICY IF EXISTS "Users must be authenticated to view companies" ON public.companies;
DROP POLICY IF EXISTS "Users must be authenticated to view subscriptions" ON public.company_subscriptions;
DROP POLICY IF EXISTS "Users must be authenticated to view dashboard" ON public.dashboard_customization;
DROP POLICY IF EXISTS "Users must be authenticated to view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users must be authenticated to view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users must be authenticated to view payments" ON public.payments;
DROP POLICY IF EXISTS "Users must be authenticated to view products" ON public.products;
DROP POLICY IF EXISTS "Users must be authenticated to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users must be authenticated to view projects" ON public.projects;
DROP POLICY IF EXISTS "Users must be authenticated to view transactions" ON public.payment_transactions;