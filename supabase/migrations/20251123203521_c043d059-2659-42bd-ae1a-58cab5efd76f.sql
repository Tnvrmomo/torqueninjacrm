-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company notifications" 
ON public.notifications FOR SELECT 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their notifications" 
ON public.notifications FOR UPDATE 
USING (user_id = auth.uid());

-- Index for performance
CREATE INDEX idx_notifications_company_user ON public.notifications(company_id, user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Low stock detection function
CREATE OR REPLACE FUNCTION public.check_low_stock_notifications()
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (company_id, user_id, type, title, message, entity_type, entity_id)
  SELECT 
    p.company_id,
    pr.user_id,
    'low_stock_alert',
    'Low Stock: ' || p.name,
    'Product "' || p.name || '" has ' || COALESCE(p.stock_quantity, 0) || ' units remaining. Reorder point: ' || COALESCE(p.reorder_point, 10),
    'product',
    p.id
  FROM public.products p
  JOIN public.profiles pr ON pr.company_id = p.company_id
  WHERE COALESCE(p.stock_quantity, 0) <= COALESCE(p.reorder_point, 10)
  AND p.is_active = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n 
    WHERE n.entity_id = p.id 
    AND n.type = 'low_stock_alert' 
    AND n.created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Overdue invoice detection
CREATE OR REPLACE FUNCTION public.check_overdue_invoices()
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (company_id, user_id, type, title, message, entity_type, entity_id)
  SELECT 
    i.company_id,
    pr.user_id,
    'overdue_invoice',
    'Overdue: Invoice #' || i.invoice_number,
    'Invoice #' || i.invoice_number || ' for ' || c.name || ' is ' || (CURRENT_DATE - i.due_date::DATE) || ' days overdue. Balance: ৳' || i.balance::TEXT,
    'invoice',
    i.id
  FROM public.invoices i
  JOIN public.clients c ON i.client_id = c.id
  JOIN public.profiles pr ON pr.company_id = i.company_id
  WHERE i.status NOT IN ('paid', 'cancelled')
  AND i.due_date < CURRENT_DATE
  AND i.balance > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n 
    WHERE n.entity_id = i.id 
    AND n.type = 'overdue_invoice' 
    AND n.created_at > NOW() - INTERVAL '7 days'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trial expiry warning
CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (company_id, user_id, type, title, message, entity_type, entity_id)
  SELECT 
    cs.company_id,
    pr.user_id,
    'subscription_expiring',
    'Trial Ending Soon',
    'Your ' || sp.name || ' plan trial ends in ' || (cs.trial_ends_at::DATE - CURRENT_DATE) || ' days. Upgrade to continue using TorqueNinja.',
    'subscription',
    cs.id
  FROM public.company_subscriptions cs
  JOIN public.subscription_plans sp ON cs.plan_id = sp.id
  JOIN public.profiles pr ON pr.company_id = cs.company_id
  WHERE cs.status = 'trial'
  AND cs.trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n 
    WHERE n.entity_id = cs.id 
    AND n.type = 'subscription_expiring' 
    AND n.created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;