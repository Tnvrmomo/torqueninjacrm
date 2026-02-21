-- Add INSERT policy for companies (needed for edge cases, trigger uses SECURITY DEFINER)
DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add DELETE policy for notifications
DO $$ BEGIN
  CREATE POLICY "Users can delete their company notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Clean up duplicate policies on quotes
DROP POLICY IF EXISTS "Users can view quotes from their company" ON public.quotes;
DROP POLICY IF EXISTS "Users can create quotes for their company" ON public.quotes;
DROP POLICY IF EXISTS "Users can update quotes from their company" ON public.quotes;
DROP POLICY IF EXISTS "Users can delete quotes from their company" ON public.quotes;
DROP POLICY IF EXISTS "Users must be authenticated to view quotes" ON public.quotes;

-- Clean up duplicate policies on expenses
DROP POLICY IF EXISTS "Users can view expenses from their company" ON public.expenses;
DROP POLICY IF EXISTS "Users can create expenses for their company" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses from their company" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses from their company" ON public.expenses;

-- Clean up duplicate policies on quote_items
DROP POLICY IF EXISTS "Users can view quote items from their company" ON public.quote_items;
DROP POLICY IF EXISTS "Users can create quote items for their company" ON public.quote_items;
DROP POLICY IF EXISTS "Users can update quote items from their company" ON public.quote_items;
DROP POLICY IF EXISTS "Users can delete quote items from their company" ON public.quote_items;

-- Clean up duplicate policies on notifications
DROP POLICY IF EXISTS "Users can view their company notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

-- Add super admin policies for recurring_invoices
DO $$ BEGIN
  CREATE POLICY "Super admins can manage all recurring invoices"
  ON public.recurring_invoices FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add super admin insert for company_subscriptions
DO $$ BEGIN
  CREATE POLICY "Super admins can insert subscriptions"
  ON public.company_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;