CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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

  -- Assign admin role to new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');

  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_log (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    company_id uuid,
    user_id uuid,
    activity_date timestamp with time zone DEFAULT now() NOT NULL,
    activity text NOT NULL,
    ip_address text,
    entity_type text,
    entity_id uuid,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    key_hash text NOT NULL,
    key_preview text NOT NULL,
    permissions text[] NOT NULL,
    is_active boolean DEFAULT true,
    last_used_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_portal_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_portal_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    company_id uuid,
    client_number text,
    name text NOT NULL,
    email text,
    phone text,
    website text,
    vat_number text,
    id_number text,
    street text,
    apt_suite text,
    city text,
    state_province text,
    postal_code text,
    country text DEFAULT 'People''s Republic of Bangladesh'::text,
    shipping_street text,
    shipping_apt_suite text,
    shipping_city text,
    shipping_state_province text,
    shipping_postal_code text,
    shipping_country text,
    balance numeric(15,2) DEFAULT 0,
    paid_to_date numeric(15,2) DEFAULT 0,
    payment_balance numeric(15,2) DEFAULT 0,
    credit_balance numeric(15,2) DEFAULT 0,
    credit_limit numeric(15,2),
    payment_terms text,
    currency text DEFAULT 'BDT'::text,
    contact_first_name text,
    contact_last_name text,
    contact_phone text,
    contact_email text,
    industry text,
    client_size text,
    classification text,
    public_notes text,
    private_notes text,
    custom_value_1 text,
    custom_value_2 text,
    custom_value_3 text,
    custom_value_4 text,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    legal_name text,
    vat_number text,
    tax_number text,
    address text,
    phone text,
    email text,
    website text,
    logo_url text,
    currency text DEFAULT 'BDT'::text,
    language text DEFAULT 'en'::text,
    timezone text DEFAULT 'Asia/Dhaka'::text,
    industry text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    category text NOT NULL,
    amount numeric NOT NULL,
    expense_date date NOT NULL,
    vendor text,
    description text,
    receipt_url text,
    payment_method text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    invoice_id uuid NOT NULL,
    product_id uuid,
    description text NOT NULL,
    quantity numeric(15,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    discount numeric(15,2) DEFAULT 0,
    tax_rate_1 numeric(5,2) DEFAULT 0,
    tax_rate_2 numeric(5,2) DEFAULT 0,
    tax_rate_3 numeric(5,2) DEFAULT 0,
    tax_name_1 text,
    tax_name_2 text,
    tax_name_3 text,
    line_total numeric(15,2) NOT NULL,
    custom_value_1 text,
    custom_value_2 text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    company_id uuid,
    client_id uuid NOT NULL,
    invoice_number text NOT NULL,
    po_number text,
    status text DEFAULT 'draft'::text,
    issue_date date NOT NULL,
    due_date date,
    sent_date timestamp with time zone,
    viewed_date timestamp with time zone,
    paid_date timestamp with time zone,
    subtotal numeric(15,2) NOT NULL,
    discount numeric(15,2) DEFAULT 0,
    is_amount_discount boolean DEFAULT false,
    tax_amount numeric(15,2) DEFAULT 0,
    total numeric(15,2) NOT NULL,
    balance numeric(15,2) NOT NULL,
    paid_to_date numeric(15,2) DEFAULT 0,
    partial_deposit numeric(15,2) DEFAULT 0,
    partial_due_date date,
    uses_inclusive_taxes boolean DEFAULT true,
    tax_name_1 text,
    tax_name_2 text,
    tax_name_3 text,
    tax_rate_1 numeric(5,2) DEFAULT 0,
    tax_rate_2 numeric(5,2) DEFAULT 0,
    tax_rate_3 numeric(5,2) DEFAULT 0,
    custom_surcharge_1 numeric(15,2) DEFAULT 0,
    custom_surcharge_2 numeric(15,2) DEFAULT 0,
    custom_surcharge_3 numeric(15,2) DEFAULT 0,
    custom_surcharge_4 numeric(15,2) DEFAULT 0,
    currency text DEFAULT 'BDT'::text,
    exchange_rate numeric(10,4) DEFAULT 1,
    payment_terms text,
    terms_conditions text,
    public_notes text,
    private_notes text,
    footer text,
    custom_value_1 text,
    custom_value_2 text,
    custom_value_3 text,
    custom_value_4 text,
    is_recurring boolean DEFAULT false,
    recurring_id uuid,
    parent_invoice_id uuid,
    auto_bill text DEFAULT 'No'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    user_id uuid,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    entity_type text,
    entity_id uuid,
    is_read boolean DEFAULT false,
    sent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    company_id uuid,
    invoice_id uuid,
    client_id uuid,
    payment_number text NOT NULL,
    amount numeric(15,2) NOT NULL,
    payment_method text,
    payment_date date NOT NULL,
    transaction_id text,
    reference text,
    status text DEFAULT 'completed'::text,
    gateway_response jsonb,
    receipt_url text,
    refund_amount numeric(15,2) DEFAULT 0,
    refund_date date,
    refund_reason text,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    sku text,
    description text,
    notes text,
    category text,
    cost_price numeric(15,2),
    sale_price numeric(15,2) NOT NULL,
    currency text DEFAULT 'BDT'::text,
    quantity numeric(15,2) DEFAULT 0,
    stock_quantity integer DEFAULT 0,
    max_quantity integer,
    low_stock_alert integer,
    reorder_point integer,
    tax_rate_1 numeric(5,2) DEFAULT 0,
    tax_rate_2 numeric(5,2) DEFAULT 0,
    tax_rate_3 numeric(5,2) DEFAULT 0,
    tax_name_1 text,
    tax_name_2 text,
    tax_name_3 text,
    tax_category integer DEFAULT 1,
    vehicle_compatibility text[],
    material_type text,
    size text,
    image_url text,
    images text[],
    custom_value_1 text,
    custom_value_2 text,
    custom_value_3 text,
    custom_value_4 text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid,
    name text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'user'::text,
    department text,
    phone text,
    avatar_url text,
    signature text,
    last_login timestamp with time zone,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    client_id uuid,
    name text NOT NULL,
    description text,
    status text DEFAULT 'design'::text,
    start_date date,
    due_date date,
    completion_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quote_id uuid NOT NULL,
    product_id uuid,
    description text NOT NULL,
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    discount numeric DEFAULT 0,
    line_total numeric NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    client_id uuid NOT NULL,
    quote_number text NOT NULL,
    issue_date date NOT NULL,
    expiry_date date,
    status text DEFAULT 'draft'::text,
    subtotal numeric NOT NULL,
    discount numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    total numeric NOT NULL,
    public_notes text,
    private_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: recurring_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    client_id uuid NOT NULL,
    frequency text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    next_invoice_date date NOT NULL,
    last_sent_date date,
    invoice_template_id uuid,
    is_active boolean DEFAULT true,
    auto_send boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: webhook_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webhook_id uuid,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    response_status integer,
    response_body text,
    error text,
    triggered_at timestamp with time zone DEFAULT now()
);


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    url text NOT NULL,
    events text[] NOT NULL,
    secret_key text,
    is_active boolean DEFAULT true,
    last_triggered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: client_portal_access client_portal_access_client_id_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_portal_access
    ADD CONSTRAINT client_portal_access_client_id_email_key UNIQUE (client_id, email);


--
-- Name: client_portal_access client_portal_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_portal_access
    ADD CONSTRAINT client_portal_access_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: recurring_invoices recurring_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_invoices
    ADD CONSTRAINT recurring_invoices_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: webhook_logs webhook_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_logs
    ADD CONSTRAINT webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_company ON public.activity_log USING btree (company_id);


--
-- Name: idx_activity_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_date ON public.activity_log USING btree (activity_date DESC);


--
-- Name: idx_activity_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_entity ON public.activity_log USING btree (entity_type, entity_id);


--
-- Name: idx_clients_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_company ON public.clients USING btree (company_id);


--
-- Name: idx_clients_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_number ON public.clients USING btree (client_number);


--
-- Name: idx_clients_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_status ON public.clients USING btree (status);


--
-- Name: idx_invoices_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_client ON public.invoices USING btree (client_id);


--
-- Name: idx_invoices_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_company ON public.invoices USING btree (company_id);


--
-- Name: idx_invoices_issue_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_issue_date ON public.invoices USING btree (issue_date DESC);


--
-- Name: idx_invoices_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_number ON public.invoices USING btree (invoice_number);


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);


--
-- Name: idx_payments_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_client ON public.payments USING btree (client_id);


--
-- Name: idx_payments_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_company ON public.payments USING btree (company_id);


--
-- Name: idx_payments_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_date ON public.payments USING btree (payment_date DESC);


--
-- Name: idx_payments_invoice; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_invoice ON public.payments USING btree (invoice_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category);


--
-- Name: idx_products_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_company ON public.products USING btree (company_id);


--
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- Name: idx_profiles_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_company_id ON public.profiles USING btree (company_id);


--
-- Name: idx_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);


--
-- Name: clients update_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: companies update_companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: expenses update_expenses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quotes update_quotes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: recurring_invoices update_recurring_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_recurring_invoices_updated_at BEFORE UPDATE ON public.recurring_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: webhooks update_webhooks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_log activity_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: activity_log activity_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: api_keys api_keys_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: client_portal_access client_portal_access_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_portal_access
    ADD CONSTRAINT client_portal_access_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: clients clients_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_parent_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_parent_invoice_id_fkey FOREIGN KEY (parent_invoice_id) REFERENCES public.invoices(id);


--
-- Name: notifications notifications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: payments payments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: payments payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: products products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: projects projects_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: quote_items quote_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: quote_items quote_items_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: quotes quotes_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: recurring_invoices recurring_invoices_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_invoices
    ADD CONSTRAINT recurring_invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: recurring_invoices recurring_invoices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_invoices
    ADD CONSTRAINT recurring_invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: recurring_invoices recurring_invoices_invoice_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_invoices
    ADD CONSTRAINT recurring_invoices_invoice_template_id_fkey FOREIGN KEY (invoice_template_id) REFERENCES public.invoices(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webhook_logs webhook_logs_webhook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_logs
    ADD CONSTRAINT webhook_logs_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES public.webhooks(id) ON DELETE CASCADE;


--
-- Name: webhooks webhooks_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: client_portal_access Clients can view their own portal access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view their own portal access" ON public.client_portal_access FOR SELECT USING ((email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)));


--
-- Name: expenses Users can create expenses for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create expenses for their company" ON public.expenses FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: projects Users can create projects for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create projects for their company" ON public.projects FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: quote_items Users can create quote items for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create quote items for their company" ON public.quote_items FOR INSERT WITH CHECK ((quote_id IN ( SELECT quotes.id
   FROM public.quotes
  WHERE (quotes.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: quotes Users can create quotes for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create quotes for their company" ON public.quotes FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: expenses Users can delete expenses from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete expenses from their company" ON public.expenses FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: projects Users can delete projects from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete projects from their company" ON public.projects FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: quote_items Users can delete quote items from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete quote items from their company" ON public.quote_items FOR DELETE USING ((quote_id IN ( SELECT quotes.id
   FROM public.quotes
  WHERE (quotes.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: quotes Users can delete quotes from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete quotes from their company" ON public.quotes FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: api_keys Users can delete their company's API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's API keys" ON public.api_keys FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: clients Users can delete their company's clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's clients" ON public.clients FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: expenses Users can delete their company's expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's expenses" ON public.expenses FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: invoice_items Users can delete their company's invoice items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's invoice items" ON public.invoice_items FOR DELETE USING ((invoice_id IN ( SELECT invoices.id
   FROM public.invoices
  WHERE (invoices.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: invoices Users can delete their company's invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's invoices" ON public.invoices FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: payments Users can delete their company's payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's payments" ON public.payments FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: products Users can delete their company's products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's products" ON public.products FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: projects Users can delete their company's projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's projects" ON public.projects FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: quote_items Users can delete their company's quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's quote items" ON public.quote_items FOR DELETE USING ((quote_id IN ( SELECT quotes.id
   FROM public.quotes
  WHERE (quotes.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: quotes Users can delete their company's quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's quotes" ON public.quotes FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: recurring_invoices Users can delete their company's recurring invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's recurring invoices" ON public.recurring_invoices FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: webhooks Users can delete their company's webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their company's webhooks" ON public.webhooks FOR DELETE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: api_keys Users can insert their company's API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's API keys" ON public.api_keys FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: activity_log Users can insert their company's activity log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's activity log" ON public.activity_log FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: clients Users can insert their company's clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's clients" ON public.clients FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: expenses Users can insert their company's expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's expenses" ON public.expenses FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: invoice_items Users can insert their company's invoice items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's invoice items" ON public.invoice_items FOR INSERT WITH CHECK ((invoice_id IN ( SELECT invoices.id
   FROM public.invoices
  WHERE (invoices.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: invoices Users can insert their company's invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's invoices" ON public.invoices FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: payments Users can insert their company's payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's payments" ON public.payments FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: products Users can insert their company's products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's products" ON public.products FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: projects Users can insert their company's projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's projects" ON public.projects FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: quote_items Users can insert their company's quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's quote items" ON public.quote_items FOR INSERT WITH CHECK ((quote_id IN ( SELECT quotes.id
   FROM public.quotes
  WHERE (quotes.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: quotes Users can insert their company's quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's quotes" ON public.quotes FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: recurring_invoices Users can insert their company's recurring invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's recurring invoices" ON public.recurring_invoices FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: webhooks Users can insert their company's webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their company's webhooks" ON public.webhooks FOR INSERT WITH CHECK ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: expenses Users can update expenses from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update expenses from their company" ON public.expenses FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: projects Users can update projects from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update projects from their company" ON public.projects FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: quote_items Users can update quote items from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update quote items from their company" ON public.quote_items FOR UPDATE USING ((quote_id IN ( SELECT quotes.id
   FROM public.quotes
  WHERE (quotes.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: quotes Users can update quotes from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update quotes from their company" ON public.quotes FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: api_keys Users can update their company's API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's API keys" ON public.api_keys FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: clients Users can update their company's clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's clients" ON public.clients FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: expenses Users can update their company's expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's expenses" ON public.expenses FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: invoice_items Users can update their company's invoice items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's invoice items" ON public.invoice_items FOR UPDATE USING ((invoice_id IN ( SELECT invoices.id
   FROM public.invoices
  WHERE (invoices.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: invoices Users can update their company's invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's invoices" ON public.invoices FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: notifications Users can update their company's notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's notifications" ON public.notifications FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: payments Users can update their company's payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's payments" ON public.payments FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: products Users can update their company's products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's products" ON public.products FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: projects Users can update their company's projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's projects" ON public.projects FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: quote_items Users can update their company's quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's quote items" ON public.quote_items FOR UPDATE USING ((quote_id IN ( SELECT quotes.id
   FROM public.quotes
  WHERE (quotes.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: quotes Users can update their company's quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's quotes" ON public.quotes FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: recurring_invoices Users can update their company's recurring invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's recurring invoices" ON public.recurring_invoices FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: webhooks Users can update their company's webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their company's webhooks" ON public.webhooks FOR UPDATE USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: companies Users can update their own company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own company" ON public.companies FOR UPDATE USING ((id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: expenses Users can view expenses from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view expenses from their company" ON public.expenses FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: projects Users can view projects from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view projects from their company" ON public.projects FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: quote_items Users can view quote items from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view quote items from their company" ON public.quote_items FOR SELECT USING ((quote_id IN ( SELECT quotes.id
   FROM public.quotes
  WHERE (quotes.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: quotes Users can view quotes from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view quotes from their company" ON public.quotes FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: api_keys Users can view their company's API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's API keys" ON public.api_keys FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: activity_log Users can view their company's activity log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's activity log" ON public.activity_log FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: clients Users can view their company's clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's clients" ON public.clients FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: expenses Users can view their company's expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's expenses" ON public.expenses FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: invoice_items Users can view their company's invoice items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's invoice items" ON public.invoice_items FOR SELECT USING ((invoice_id IN ( SELECT invoices.id
   FROM public.invoices
  WHERE (invoices.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: invoices Users can view their company's invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's invoices" ON public.invoices FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: notifications Users can view their company's notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's notifications" ON public.notifications FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: payments Users can view their company's payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's payments" ON public.payments FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: products Users can view their company's products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's products" ON public.products FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: projects Users can view their company's projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's projects" ON public.projects FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: quote_items Users can view their company's quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's quote items" ON public.quote_items FOR SELECT USING ((quote_id IN ( SELECT quotes.id
   FROM public.quotes
  WHERE (quotes.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: quotes Users can view their company's quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's quotes" ON public.quotes FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: recurring_invoices Users can view their company's recurring invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's recurring invoices" ON public.recurring_invoices FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: webhook_logs Users can view their company's webhook logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's webhook logs" ON public.webhook_logs FOR SELECT USING ((webhook_id IN ( SELECT webhooks.id
   FROM public.webhooks
  WHERE (webhooks.company_id IN ( SELECT profiles.company_id
           FROM public.profiles
          WHERE (profiles.user_id = auth.uid()))))));


--
-- Name: webhooks Users can view their company's webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their company's webhooks" ON public.webhooks FOR SELECT USING ((company_id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: companies Users can view their own company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own company" ON public.companies FOR SELECT USING ((id IN ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: activity_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

--
-- Name: api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: client_portal_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_portal_access ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

--
-- Name: quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: recurring_invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: webhook_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: webhooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


