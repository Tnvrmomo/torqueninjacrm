-- Phase 1a: Add super_admin to enum (must be separate transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';