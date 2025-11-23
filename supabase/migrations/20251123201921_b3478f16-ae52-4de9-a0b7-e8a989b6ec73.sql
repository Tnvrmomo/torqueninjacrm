-- Fix security warning: Set search_path for update_subscription_timestamp function
CREATE OR REPLACE FUNCTION public.update_subscription_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;