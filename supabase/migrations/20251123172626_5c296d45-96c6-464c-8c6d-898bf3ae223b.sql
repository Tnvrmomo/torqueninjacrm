-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  legal_name TEXT,
  vat_number TEXT,
  tax_number TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  currency TEXT DEFAULT 'BDT',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Dhaka',
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (add policies later after profiles table is created)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  signature TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Now add RLS policies for companies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  USING (id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_number TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  vat_number TEXT,
  id_number TEXT,
  
  -- Billing Address
  street TEXT,
  apt_suite TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'People''s Republic of Bangladesh',
  
  -- Shipping Address
  shipping_street TEXT,
  shipping_apt_suite TEXT,
  shipping_city TEXT,
  shipping_state_province TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  
  -- Financial
  balance DECIMAL(15,2) DEFAULT 0,
  paid_to_date DECIMAL(15,2) DEFAULT 0,
  payment_balance DECIMAL(15,2) DEFAULT 0,
  credit_balance DECIMAL(15,2) DEFAULT 0,
  credit_limit DECIMAL(15,2),
  payment_terms TEXT,
  currency TEXT DEFAULT 'BDT',
  
  -- Contact Person
  contact_first_name TEXT,
  contact_last_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Additional
  industry TEXT,
  client_size TEXT,
  classification TEXT,
  public_notes TEXT,
  private_notes TEXT,
  
  -- Custom Fields
  custom_value_1 TEXT,
  custom_value_2 TEXT,
  custom_value_3 TEXT,
  custom_value_4 TEXT,
  
  -- System
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view their company's clients"
  ON clients FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their company's clients"
  ON clients FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their company's clients"
  ON clients FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their company's clients"
  ON clients FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_clients_number ON clients(client_number);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_company_id ON profiles(company_id);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  notes TEXT,
  category TEXT,
  
  -- Pricing
  cost_price DECIMAL(15,2),
  sale_price DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  
  -- Inventory
  quantity DECIMAL(15,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  max_quantity INTEGER,
  low_stock_alert INTEGER,
  reorder_point INTEGER,
  
  -- Tax
  tax_rate_1 DECIMAL(5,2) DEFAULT 0,
  tax_rate_2 DECIMAL(5,2) DEFAULT 0,
  tax_rate_3 DECIMAL(5,2) DEFAULT 0,
  tax_name_1 TEXT,
  tax_name_2 TEXT,
  tax_name_3 TEXT,
  tax_category INTEGER DEFAULT 1,
  
  -- Automotive Specific
  vehicle_compatibility TEXT[],
  material_type TEXT,
  size TEXT,
  
  -- Images
  image_url TEXT,
  images TEXT[],
  
  -- Custom Fields
  custom_value_1 TEXT,
  custom_value_2 TEXT,
  custom_value_3 TEXT,
  custom_value_4 TEXT,
  
  -- System
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can view their company's products"
  ON products FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their company's products"
  ON products FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their company's products"
  ON products FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their company's products"
  ON products FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Invoice Info
  invoice_number TEXT NOT NULL,
  po_number TEXT,
  status TEXT DEFAULT 'draft',
  
  -- Dates
  issue_date DATE NOT NULL,
  due_date DATE,
  sent_date TIMESTAMP WITH TIME ZONE,
  viewed_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  
  -- Financial
  subtotal DECIMAL(15,2) NOT NULL,
  discount DECIMAL(15,2) DEFAULT 0,
  is_amount_discount BOOLEAN DEFAULT false,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  balance DECIMAL(15,2) NOT NULL,
  paid_to_date DECIMAL(15,2) DEFAULT 0,
  
  -- Partial Payment
  partial_deposit DECIMAL(15,2) DEFAULT 0,
  partial_due_date DATE,
  
  -- Tax Details
  uses_inclusive_taxes BOOLEAN DEFAULT true,
  tax_name_1 TEXT,
  tax_name_2 TEXT,
  tax_name_3 TEXT,
  tax_rate_1 DECIMAL(5,2) DEFAULT 0,
  tax_rate_2 DECIMAL(5,2) DEFAULT 0,
  tax_rate_3 DECIMAL(5,2) DEFAULT 0,
  
  -- Surcharges
  custom_surcharge_1 DECIMAL(15,2) DEFAULT 0,
  custom_surcharge_2 DECIMAL(15,2) DEFAULT 0,
  custom_surcharge_3 DECIMAL(15,2) DEFAULT 0,
  custom_surcharge_4 DECIMAL(15,2) DEFAULT 0,
  
  -- Currency
  currency TEXT DEFAULT 'BDT',
  exchange_rate DECIMAL(10,4) DEFAULT 1,
  
  -- Terms & Notes
  payment_terms TEXT,
  terms_conditions TEXT,
  public_notes TEXT,
  private_notes TEXT,
  footer TEXT,
  
  -- Custom Fields
  custom_value_1 TEXT,
  custom_value_2 TEXT,
  custom_value_3 TEXT,
  custom_value_4 TEXT,
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurring_id UUID,
  parent_invoice_id UUID REFERENCES invoices(id),
  
  -- Auto Billing
  auto_bill TEXT DEFAULT 'No',
  
  -- System
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view their company's invoices"
  ON invoices FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their company's invoices"
  ON invoices FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their company's invoices"
  ON invoices FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their company's invoices"
  ON invoices FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date DESC);

-- Invoice Line Items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Item Details
  description TEXT NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  discount DECIMAL(15,2) DEFAULT 0,
  
  -- Tax
  tax_rate_1 DECIMAL(5,2) DEFAULT 0,
  tax_rate_2 DECIMAL(5,2) DEFAULT 0,
  tax_rate_3 DECIMAL(5,2) DEFAULT 0,
  tax_name_1 TEXT,
  tax_name_2 TEXT,
  tax_name_3 TEXT,
  
  -- Calculated
  line_total DECIMAL(15,2) NOT NULL,
  
  -- Custom
  custom_value_1 TEXT,
  custom_value_2 TEXT,
  
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_items
CREATE POLICY "Users can view their company's invoice items"
  ON invoice_items FOR SELECT
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert their company's invoice items"
  ON invoice_items FOR INSERT
  WITH CHECK (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update their company's invoice items"
  ON invoice_items FOR UPDATE
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete their company's invoice items"
  ON invoice_items FOR DELETE
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  payment_number TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT,
  payment_date DATE NOT NULL,
  transaction_id TEXT,
  reference TEXT,
  
  status TEXT DEFAULT 'completed',
  
  -- Gateway Info
  gateway_response JSONB,
  receipt_url TEXT,
  
  -- Refund
  refund_amount DECIMAL(15,2) DEFAULT 0,
  refund_date DATE,
  refund_reason TEXT,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view their company's payments"
  ON payments FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their company's payments"
  ON payments FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their company's payments"
  ON payments FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their company's payments"
  ON payments FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);

-- Activity Log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  activity TEXT NOT NULL,
  ip_address TEXT,
  
  -- Related entities
  entity_type TEXT,
  entity_id UUID,
  
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_log
CREATE POLICY "Users can view their company's activity log"
  ON activity_log FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their company's activity log"
  ON activity_log FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles 
    WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_activity_company ON activity_log(company_id);
CREATE INDEX idx_activity_date ON activity_log(activity_date DESC);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();