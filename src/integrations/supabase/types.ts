export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity: string
          activity_date: string
          company_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity: string
          activity_date?: string
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity?: string
          activity_date?: string
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_entity_id: string | null
          target_entity_type: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_entity_id?: string | null
          target_entity_type?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_entity_id?: string | null
          target_entity_type?: string | null
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          company_id: string
          cost_bdt: number | null
          cost_usd: number | null
          created_at: string | null
          id: string
          tokens_used: number | null
          usage_type: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          cost_bdt?: number | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          tokens_used?: number | null
          usage_type: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          cost_bdt?: number | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          tokens_used?: number | null
          usage_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          company_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_preview: string
          last_used_at: string | null
          name: string
          permissions: string[]
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_preview: string
          last_used_at?: string | null
          name: string
          permissions: string[]
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_preview?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_access: {
        Row: {
          client_id: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          apt_suite: string | null
          balance: number | null
          city: string | null
          classification: string | null
          client_number: string | null
          client_size: string | null
          company_id: string | null
          contact_email: string | null
          contact_first_name: string | null
          contact_last_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          credit_balance: number | null
          credit_limit: number | null
          currency: string | null
          custom_value_1: string | null
          custom_value_2: string | null
          custom_value_3: string | null
          custom_value_4: string | null
          email: string | null
          id: string
          id_number: string | null
          industry: string | null
          name: string
          paid_to_date: number | null
          payment_balance: number | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          private_notes: string | null
          public_notes: string | null
          shipping_apt_suite: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_postal_code: string | null
          shipping_state_province: string | null
          shipping_street: string | null
          state_province: string | null
          status: string | null
          street: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          apt_suite?: string | null
          balance?: number | null
          city?: string | null
          classification?: string | null
          client_number?: string | null
          client_size?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          credit_balance?: number | null
          credit_limit?: number | null
          currency?: string | null
          custom_value_1?: string | null
          custom_value_2?: string | null
          custom_value_3?: string | null
          custom_value_4?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          industry?: string | null
          name: string
          paid_to_date?: number | null
          payment_balance?: number | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          private_notes?: string | null
          public_notes?: string | null
          shipping_apt_suite?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state_province?: string | null
          shipping_street?: string | null
          state_province?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          apt_suite?: string | null
          balance?: number | null
          city?: string | null
          classification?: string | null
          client_number?: string | null
          client_size?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          credit_balance?: number | null
          credit_limit?: number | null
          currency?: string | null
          custom_value_1?: string | null
          custom_value_2?: string | null
          custom_value_3?: string | null
          custom_value_4?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          industry?: string | null
          name?: string
          paid_to_date?: number | null
          payment_balance?: number | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          private_notes?: string | null
          public_notes?: string | null
          shipping_apt_suite?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state_province?: string | null
          shipping_street?: string | null
          state_province?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          id: string
          industry: string | null
          language: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          phone: string | null
          tax_number: string | null
          timezone: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          language?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          tax_number?: string | null
          timezone?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          language?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          tax_number?: string | null
          timezone?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_subscriptions: {
        Row: {
          amount_paid: number | null
          cancelled_at: string | null
          company_id: string
          created_at: string | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_method: string | null
          plan_id: string
          status: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          cancelled_at?: string | null
          company_id: string
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_id: string
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          cancelled_at?: string | null
          company_id?: string
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          activated_at: string | null
          company_id: string
          created_at: string | null
          dns_records: Json | null
          domain: string
          id: string
          ssl_status: string | null
          status: string | null
          updated_at: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          activated_at?: string | null
          company_id: string
          created_at?: string | null
          dns_records?: Json | null
          domain: string
          id?: string
          ssl_status?: string | null
          status?: string | null
          updated_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          activated_at?: string | null
          company_id?: string
          created_at?: string | null
          dns_records?: Json | null
          domain?: string
          id?: string
          ssl_status?: string | null
          status?: string | null
          updated_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_customization: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          theme_settings: Json | null
          updated_at: string | null
          visible_modules: Json | null
          widget_layout: Json | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          theme_settings?: Json | null
          updated_at?: string | null
          visible_modules?: Json | null
          widget_layout?: Json | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          theme_settings?: Json | null
          updated_at?: string | null
          visible_modules?: Json | null
          widget_layout?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_customization_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          company_id: string | null
          created_at: string | null
          description: string | null
          expense_date: string
          id: string
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          category: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          expense_date: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          custom_value_1: string | null
          custom_value_2: string | null
          description: string
          discount: number | null
          id: string
          invoice_id: string
          line_total: number
          product_id: string | null
          quantity: number
          sort_order: number | null
          tax_name_1: string | null
          tax_name_2: string | null
          tax_name_3: string | null
          tax_rate_1: number | null
          tax_rate_2: number | null
          tax_rate_3: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          custom_value_1?: string | null
          custom_value_2?: string | null
          description: string
          discount?: number | null
          id?: string
          invoice_id: string
          line_total: number
          product_id?: string | null
          quantity: number
          sort_order?: number | null
          tax_name_1?: string | null
          tax_name_2?: string | null
          tax_name_3?: string | null
          tax_rate_1?: number | null
          tax_rate_2?: number | null
          tax_rate_3?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          custom_value_1?: string | null
          custom_value_2?: string | null
          description?: string
          discount?: number | null
          id?: string
          invoice_id?: string
          line_total?: number
          product_id?: string | null
          quantity?: number
          sort_order?: number | null
          tax_name_1?: string | null
          tax_name_2?: string | null
          tax_name_3?: string | null
          tax_rate_1?: number | null
          tax_rate_2?: number | null
          tax_rate_3?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_templates: {
        Row: {
          accent_color: string | null
          bank_details: Json | null
          company_id: string | null
          created_at: string | null
          footer_text: string | null
          header_text: string | null
          id: string
          is_default: boolean | null
          logo_position: string | null
          name: string
          payment_instructions: string | null
          primary_color: string | null
          secondary_color: string | null
          show_bank_details: boolean | null
          show_payment_instructions: boolean | null
          show_qr_code: boolean | null
          template_type: string | null
          terms_text: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          bank_details?: Json | null
          company_id?: string | null
          created_at?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_default?: boolean | null
          logo_position?: string | null
          name: string
          payment_instructions?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_bank_details?: boolean | null
          show_payment_instructions?: boolean | null
          show_qr_code?: boolean | null
          template_type?: string | null
          terms_text?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          bank_details?: Json | null
          company_id?: string | null
          created_at?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_default?: boolean | null
          logo_position?: string | null
          name?: string
          payment_instructions?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_bank_details?: boolean | null
          show_payment_instructions?: boolean | null
          show_qr_code?: boolean | null
          template_type?: string | null
          terms_text?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          auto_bill: string | null
          balance: number
          client_id: string
          company_id: string | null
          created_at: string | null
          currency: string | null
          custom_surcharge_1: number | null
          custom_surcharge_2: number | null
          custom_surcharge_3: number | null
          custom_surcharge_4: number | null
          custom_value_1: string | null
          custom_value_2: string | null
          custom_value_3: string | null
          custom_value_4: string | null
          discount: number | null
          due_date: string | null
          exchange_rate: number | null
          footer: string | null
          id: string
          invoice_number: string
          is_amount_discount: boolean | null
          is_recurring: boolean | null
          issue_date: string
          paid_date: string | null
          paid_to_date: number | null
          parent_invoice_id: string | null
          partial_deposit: number | null
          partial_due_date: string | null
          payment_terms: string | null
          po_number: string | null
          private_notes: string | null
          public_notes: string | null
          recurring_id: string | null
          sent_date: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          tax_name_1: string | null
          tax_name_2: string | null
          tax_name_3: string | null
          tax_rate_1: number | null
          tax_rate_2: number | null
          tax_rate_3: number | null
          terms_conditions: string | null
          total: number
          updated_at: string | null
          uses_inclusive_taxes: boolean | null
          viewed_date: string | null
        }
        Insert: {
          auto_bill?: string | null
          balance: number
          client_id: string
          company_id?: string | null
          created_at?: string | null
          currency?: string | null
          custom_surcharge_1?: number | null
          custom_surcharge_2?: number | null
          custom_surcharge_3?: number | null
          custom_surcharge_4?: number | null
          custom_value_1?: string | null
          custom_value_2?: string | null
          custom_value_3?: string | null
          custom_value_4?: string | null
          discount?: number | null
          due_date?: string | null
          exchange_rate?: number | null
          footer?: string | null
          id?: string
          invoice_number: string
          is_amount_discount?: boolean | null
          is_recurring?: boolean | null
          issue_date: string
          paid_date?: string | null
          paid_to_date?: number | null
          parent_invoice_id?: string | null
          partial_deposit?: number | null
          partial_due_date?: string | null
          payment_terms?: string | null
          po_number?: string | null
          private_notes?: string | null
          public_notes?: string | null
          recurring_id?: string | null
          sent_date?: string | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          tax_name_1?: string | null
          tax_name_2?: string | null
          tax_name_3?: string | null
          tax_rate_1?: number | null
          tax_rate_2?: number | null
          tax_rate_3?: number | null
          terms_conditions?: string | null
          total: number
          updated_at?: string | null
          uses_inclusive_taxes?: boolean | null
          viewed_date?: string | null
        }
        Update: {
          auto_bill?: string | null
          balance?: number
          client_id?: string
          company_id?: string | null
          created_at?: string | null
          currency?: string | null
          custom_surcharge_1?: number | null
          custom_surcharge_2?: number | null
          custom_surcharge_3?: number | null
          custom_surcharge_4?: number | null
          custom_value_1?: string | null
          custom_value_2?: string | null
          custom_value_3?: string | null
          custom_value_4?: string | null
          discount?: number | null
          due_date?: string | null
          exchange_rate?: number | null
          footer?: string | null
          id?: string
          invoice_number?: string
          is_amount_discount?: boolean | null
          is_recurring?: boolean | null
          issue_date?: string
          paid_date?: string | null
          paid_to_date?: number | null
          parent_invoice_id?: string | null
          partial_deposit?: number | null
          partial_due_date?: string | null
          payment_terms?: string | null
          po_number?: string | null
          private_notes?: string | null
          public_notes?: string | null
          recurring_id?: string | null
          sent_date?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_name_1?: string | null
          tax_name_2?: string | null
          tax_name_3?: string | null
          tax_rate_1?: number | null
          tax_rate_2?: number | null
          tax_rate_3?: number | null
          terms_conditions?: string | null
          total?: number
          updated_at?: string | null
          uses_inclusive_taxes?: boolean | null
          viewed_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_parent_invoice_id_fkey"
            columns: ["parent_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          company_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string
          sent_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sent_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount_bdt: number | null
          amount_usd: number | null
          company_id: string
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          payment_gateway_id: string | null
          payment_method: string
          status: string | null
          subscription_id: string | null
        }
        Insert: {
          amount_bdt?: number | null
          amount_usd?: number | null
          company_id: string
          created_at?: string | null
          currency: string
          id?: string
          metadata?: Json | null
          payment_gateway_id?: string | null
          payment_method: string
          status?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount_bdt?: number | null
          amount_usd?: number | null
          company_id?: string
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          payment_gateway_id?: string | null
          payment_method?: string
          status?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "company_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          company_id: string | null
          created_at: string | null
          gateway_response: Json | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string | null
          payment_number: string
          receipt_url: string | null
          reference: string | null
          refund_amount: number | null
          refund_date: string | null
          refund_reason: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          payment_number: string
          receipt_url?: string | null
          reference?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          refund_reason?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_number?: string
          receipt_url?: string | null
          reference?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          refund_reason?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          company_id: string | null
          cost_price: number | null
          created_at: string | null
          currency: string | null
          custom_value_1: string | null
          custom_value_2: string | null
          custom_value_3: string | null
          custom_value_4: string | null
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean | null
          low_stock_alert: number | null
          material_type: string | null
          max_quantity: number | null
          name: string
          notes: string | null
          quantity: number | null
          reorder_point: number | null
          sale_price: number
          size: string | null
          sku: string | null
          stock_quantity: number | null
          tax_category: number | null
          tax_name_1: string | null
          tax_name_2: string | null
          tax_name_3: string | null
          tax_rate_1: number | null
          tax_rate_2: number | null
          tax_rate_3: number | null
          updated_at: string | null
          vehicle_compatibility: string[] | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          currency?: string | null
          custom_value_1?: string | null
          custom_value_2?: string | null
          custom_value_3?: string | null
          custom_value_4?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          low_stock_alert?: number | null
          material_type?: string | null
          max_quantity?: number | null
          name: string
          notes?: string | null
          quantity?: number | null
          reorder_point?: number | null
          sale_price: number
          size?: string | null
          sku?: string | null
          stock_quantity?: number | null
          tax_category?: number | null
          tax_name_1?: string | null
          tax_name_2?: string | null
          tax_name_3?: string | null
          tax_rate_1?: number | null
          tax_rate_2?: number | null
          tax_rate_3?: number | null
          updated_at?: string | null
          vehicle_compatibility?: string[] | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          currency?: string | null
          custom_value_1?: string | null
          custom_value_2?: string | null
          custom_value_3?: string | null
          custom_value_4?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          low_stock_alert?: number | null
          material_type?: string | null
          max_quantity?: number | null
          name?: string
          notes?: string | null
          quantity?: number | null
          reorder_point?: number | null
          sale_price?: number
          size?: string | null
          sku?: string | null
          stock_quantity?: number | null
          tax_category?: number | null
          tax_name_1?: string | null
          tax_name_2?: string | null
          tax_name_3?: string | null
          tax_rate_1?: number | null
          tax_rate_2?: number | null
          tax_rate_3?: number | null
          updated_at?: string | null
          vehicle_compatibility?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          last_login: string | null
          name: string
          phone: string | null
          role: string | null
          signature: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id?: string
          last_login?: string | null
          name: string
          phone?: string | null
          role?: string | null
          signature?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          phone?: string | null
          role?: string | null
          signature?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          company_id: string | null
          completion_date: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          notes: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string
          discount: number | null
          id: string
          line_total: number
          product_id: string | null
          quantity: number
          quote_id: string
          sort_order: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          discount?: number | null
          id?: string
          line_total: number
          product_id?: string | null
          quantity: number
          quote_id: string
          sort_order?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          discount?: number | null
          id?: string
          line_total?: number
          product_id?: string | null
          quantity?: number
          quote_id?: string
          sort_order?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string
          company_id: string | null
          created_at: string | null
          discount: number | null
          expiry_date: string | null
          id: string
          issue_date: string
          private_notes: string | null
          public_notes: string | null
          quote_number: string
          status: string | null
          subtotal: number
          tax_amount: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          client_id: string
          company_id?: string | null
          created_at?: string | null
          discount?: number | null
          expiry_date?: string | null
          id?: string
          issue_date: string
          private_notes?: string | null
          public_notes?: string | null
          quote_number: string
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          company_id?: string | null
          created_at?: string | null
          discount?: number | null
          expiry_date?: string | null
          id?: string
          issue_date?: string
          private_notes?: string | null
          public_notes?: string | null
          quote_number?: string
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoices: {
        Row: {
          auto_send: boolean | null
          client_id: string
          company_id: string | null
          created_at: string | null
          end_date: string | null
          frequency: string
          id: string
          invoice_template_id: string | null
          is_active: boolean | null
          last_sent_date: string | null
          next_invoice_date: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          auto_send?: boolean | null
          client_id: string
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          invoice_template_id?: string | null
          is_active?: boolean | null
          last_sent_date?: string | null
          next_invoice_date: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          auto_send?: boolean | null
          client_id?: string
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          invoice_template_id?: string | null
          is_active?: boolean | null
          last_sent_date?: string | null
          next_invoice_date?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_invoice_template_id_fkey"
            columns: ["invoice_template_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          ai_queries_limit: number | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_one_time: boolean | null
          name: string
          price_bdt: number
          price_usd: number
        }
        Insert: {
          ai_queries_limit?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_one_time?: boolean | null
          name: string
          price_bdt: number
          price_usd: number
        }
        Update: {
          ai_queries_limit?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_one_time?: boolean | null
          name?: string
          price_bdt?: number
          price_usd?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          error: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          triggered_at: string | null
          webhook_id: string | null
        }
        Insert: {
          error?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          triggered_at?: string | null
          webhook_id?: string | null
        }
        Update: {
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          triggered_at?: string | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          company_id: string | null
          created_at: string | null
          events: string[]
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          secret_key: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          events: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          secret_key?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          secret_key?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_low_stock_notifications: { Args: never; Returns: undefined }
      check_overdue_invoices: { Args: never; Returns: undefined }
      check_subscription_expiry: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "super_admin"],
    },
  },
} as const
