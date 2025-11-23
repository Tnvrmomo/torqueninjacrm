-- Fix critical security vulnerability: Add authentication requirement to all publicly readable tables

-- profiles table - Add authentication check
CREATE POLICY "Users must be authenticated to view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- clients table - Add authentication check
CREATE POLICY "Users must be authenticated to view clients"
ON public.clients
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- client_portal_access - Add authentication check
CREATE POLICY "Authenticated access to portal"
ON public.client_portal_access
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- companies table - Add authentication check
CREATE POLICY "Users must be authenticated to view companies"
ON public.companies
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- invoices table - Add authentication check
CREATE POLICY "Users must be authenticated to view invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- payments table - Add authentication check
CREATE POLICY "Users must be authenticated to view payments"
ON public.payments
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- products table - Add authentication check
CREATE POLICY "Users must be authenticated to view products"
ON public.products
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- quotes table - Add authentication check
CREATE POLICY "Users must be authenticated to view quotes"
ON public.quotes
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- expenses table - Add authentication check
CREATE POLICY "Users must be authenticated to view expenses"
ON public.expenses
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- projects table - Add authentication check
CREATE POLICY "Users must be authenticated to view projects"
ON public.projects
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- company_subscriptions - Add authentication check
CREATE POLICY "Users must be authenticated to view subscriptions"
ON public.company_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- payment_transactions - Add authentication check
CREATE POLICY "Users must be authenticated to view transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- ai_usage - Add authentication check
CREATE POLICY "Users must be authenticated to view AI usage"
ON public.ai_usage
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- dashboard_customization - Add authentication check
CREATE POLICY "Users must be authenticated to view dashboard"
ON public.dashboard_customization
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));

-- activity_log - Add authentication check
CREATE POLICY "Users must be authenticated to view activity"
ON public.activity_log
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND company_id IN (
  SELECT company_id FROM profiles WHERE user_id = auth.uid()
));