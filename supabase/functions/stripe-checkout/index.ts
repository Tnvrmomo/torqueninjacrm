import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, currency } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user and company
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.company_id) {
      throw new Error('Profile not found');
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    const amount = currency === 'USD' ? plan.price_usd : plan.price_bdt;

    // Create payment transaction record
    const { data: transaction } = await supabase
      .from('payment_transactions')
      .insert({
        company_id: profile.company_id,
        amount_bdt: currency === 'BDT' ? amount : null,
        amount_usd: currency === 'USD' ? amount : null,
        currency,
        payment_method: 'stripe',
        status: 'pending',
        metadata: { plan_id: planId, plan_name: plan.name }
      })
      .select()
      .single();

    // Return mock checkout URL (requires STRIPE_SECRET_KEY to be configured)
    const checkoutUrl = `${supabaseUrl}/functions/v1/stripe-webhook?session_id=${transaction.id}`;

    return new Response(
      JSON.stringify({ 
        checkoutUrl,
        message: 'Stripe integration requires STRIPE_SECRET_KEY to be configured'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
