-- Enable RLS on quotes table if not already enabled
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for quotes table
CREATE POLICY "Users can view quotes from their company"
ON public.quotes
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create quotes for their company"
ON public.quotes
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update quotes from their company"
ON public.quotes
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete quotes from their company"
ON public.quotes
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Enable RLS on expenses table if not already enabled
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses table
CREATE POLICY "Users can view expenses from their company"
ON public.expenses
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create expenses for their company"
ON public.expenses
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update expenses from their company"
ON public.expenses
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete expenses from their company"
ON public.expenses
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Enable RLS on projects table if not already enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Users can view projects from their company"
ON public.projects
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create projects for their company"
ON public.projects
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update projects from their company"
ON public.projects
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete projects from their company"
ON public.projects
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Enable RLS on quote_items table if not already enabled
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Create policies for quote_items table
CREATE POLICY "Users can view quote items from their company"
ON public.quote_items
FOR SELECT
USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create quote items for their company"
ON public.quote_items
FOR INSERT
WITH CHECK (
  quote_id IN (
    SELECT id FROM public.quotes WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update quote items from their company"
ON public.quote_items
FOR UPDATE
USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete quote items from their company"
ON public.quote_items
FOR DELETE
USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);