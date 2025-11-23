-- Create recurring_invoices table for automation
CREATE TABLE public.recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  frequency TEXT NOT NULL, -- daily, weekly, monthly, quarterly, yearly
  start_date DATE NOT NULL,
  end_date DATE,
  next_invoice_date DATE NOT NULL,
  last_sent_date DATE,
  invoice_template_id UUID REFERENCES public.invoices(id),
  is_active BOOLEAN DEFAULT true,
  auto_send BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's recurring invoices"
ON public.recurring_invoices FOR SELECT
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their company's recurring invoices"
ON public.recurring_invoices FOR INSERT
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their company's recurring invoices"
ON public.recurring_invoices FOR UPDATE
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their company's recurring invoices"
ON public.recurring_invoices FOR DELETE
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Create notifications table for reminders
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  user_id UUID,
  type TEXT NOT NULL, -- payment_reminder, low_stock, overdue_invoice
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's notifications"
ON public.notifications FOR SELECT
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their company's notifications"
ON public.notifications FOR UPDATE
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Create webhooks table
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- invoice.created, invoice.paid, payment.received, etc.
  secret_key TEXT,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's webhooks"
ON public.webhooks FOR SELECT
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their company's webhooks"
ON public.webhooks FOR INSERT
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their company's webhooks"
ON public.webhooks FOR UPDATE
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their company's webhooks"
ON public.webhooks FOR DELETE
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Create webhook_logs table
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  error TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's webhook logs"
ON public.webhook_logs FOR SELECT
USING (webhook_id IN (SELECT id FROM webhooks WHERE company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())));

-- Create client_portal_access table
CREATE TABLE public.client_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, email)
);

ALTER TABLE public.client_portal_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own portal access"
ON public.client_portal_access FOR SELECT
USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Add triggers
CREATE TRIGGER update_recurring_invoices_updated_at
BEFORE UPDATE ON public.recurring_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create API keys table for external integrations
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_preview TEXT NOT NULL, -- First few chars for display
  permissions TEXT[] NOT NULL, -- read:invoices, write:clients, etc.
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's API keys"
ON public.api_keys FOR SELECT
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their company's API keys"
ON public.api_keys FOR INSERT
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their company's API keys"
ON public.api_keys FOR UPDATE
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their company's API keys"
ON public.api_keys FOR DELETE
USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));