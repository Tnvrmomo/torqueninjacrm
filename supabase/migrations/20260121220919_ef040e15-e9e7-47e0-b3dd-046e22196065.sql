-- Phase 1: Fix admin access for torquestickers@gmail.com
DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'torquestickers@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    DELETE FROM user_roles WHERE user_id = v_user_id;
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'super_admin');
    UPDATE profiles SET name = 'Torque Stickers Admin' WHERE user_id = v_user_id;
    SELECT company_id INTO v_company_id FROM profiles WHERE user_id = v_user_id;
    IF v_company_id IS NOT NULL THEN
      UPDATE companies SET name = 'Torque Stickers', legal_name = 'Torque Stickers BD' WHERE id = v_company_id;
    END IF;
  END IF;
END $$;

-- Phase 2: Create invoice_templates table
CREATE TABLE IF NOT EXISTS public.invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  template_type TEXT DEFAULT 'modern',
  primary_color TEXT DEFAULT '#871113',
  secondary_color TEXT DEFAULT '#374151',
  accent_color TEXT DEFAULT '#f59e0b',
  logo_position TEXT DEFAULT 'left',
  show_payment_instructions BOOLEAN DEFAULT true,
  show_bank_details BOOLEAN DEFAULT true,
  show_qr_code BOOLEAN DEFAULT false,
  header_text TEXT,
  footer_text TEXT,
  terms_text TEXT,
  payment_instructions TEXT,
  bank_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_templates
DO $$ BEGIN
  CREATE POLICY "Users can view their company templates" ON public.invoice_templates FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their company templates" ON public.invoice_templates FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their company templates" ON public.invoice_templates FOR UPDATE
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their company templates" ON public.invoice_templates FOR DELETE
  USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage all templates" ON public.invoice_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Fix notifications INSERT policy
DO $$ BEGIN
  CREATE POLICY "Users can insert notifications for their company" ON public.notifications FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Fix webhook_logs policies
DROP POLICY IF EXISTS "System can insert webhook logs" ON public.webhook_logs;
DO $$ BEGIN
  CREATE POLICY "Allow insert webhook logs" ON public.webhook_logs FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their company webhook logs" ON public.webhook_logs FOR UPDATE
  USING (webhook_id IN (SELECT id FROM webhooks WHERE company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their company webhook logs" ON public.webhook_logs FOR DELETE
  USING (webhook_id IN (SELECT id FROM webhooks WHERE company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create trigger for updated_at on invoice_templates
CREATE OR REPLACE FUNCTION update_invoice_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_templates_timestamp ON invoice_templates;
CREATE TRIGGER update_invoice_templates_timestamp
BEFORE UPDATE ON invoice_templates
FOR EACH ROW EXECUTE FUNCTION update_invoice_templates_updated_at();