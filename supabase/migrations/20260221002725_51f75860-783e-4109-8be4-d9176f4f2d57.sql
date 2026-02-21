
-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  social_linkedin TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  source_url TEXT,
  ai_score INTEGER DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_category TEXT,
  ai_notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','converted','lost')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company leads" ON public.leads FOR SELECT
  TO authenticated USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert their company leads" ON public.leads FOR INSERT
  TO authenticated WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their company leads" ON public.leads FOR UPDATE
  TO authenticated USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete their company leads" ON public.leads FOR DELETE
  TO authenticated USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Super admins can manage all leads" ON public.leads FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

-- Lead campaigns table
CREATE TABLE public.lead_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  from_name TEXT,
  from_email TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','paused')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lead_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company campaigns" ON public.lead_campaigns FOR SELECT
  TO authenticated USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert their company campaigns" ON public.lead_campaigns FOR INSERT
  TO authenticated WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their company campaigns" ON public.lead_campaigns FOR UPDATE
  TO authenticated USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete their company campaigns" ON public.lead_campaigns FOR DELETE
  TO authenticated USING (company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Campaign emails tracking
CREATE TABLE public.campaign_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.lead_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','opened','clicked','bounced','failed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  mailgun_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.campaign_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their campaign emails" ON public.campaign_emails FOR SELECT
  TO authenticated USING (campaign_id IN (SELECT id FROM lead_campaigns WHERE company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can insert their campaign emails" ON public.campaign_emails FOR INSERT
  TO authenticated WITH CHECK (campaign_id IN (SELECT id FROM lead_campaigns WHERE company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can update their campaign emails" ON public.campaign_emails FOR UPDATE
  TO authenticated USING (campaign_id IN (SELECT id FROM lead_campaigns WHERE company_id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())));

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lead_campaigns_updated_at BEFORE UPDATE ON public.lead_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_leads_company_id ON public.leads(company_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_ai_score ON public.leads(ai_score DESC);
CREATE INDEX idx_lead_campaigns_company_id ON public.lead_campaigns(company_id);
CREATE INDEX idx_campaign_emails_campaign_id ON public.campaign_emails(campaign_id);
CREATE INDEX idx_campaign_emails_lead_id ON public.campaign_emails(lead_id);
