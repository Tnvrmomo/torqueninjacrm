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
    const { planId, phoneNumber } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    const amount = plan.price_bdt;

    // Create payment transaction record
    const { data: transaction } = await supabase
      .from('payment_transactions')
      .insert({
        company_id: profile.company_id,
        amount_bdt: amount,
        currency: 'BDT',
        payment_method: 'nagad',
        status: 'pending',
        metadata: { plan_id: planId, plan_name: plan.name, phone_number: phoneNumber }
      })
      .select()
      .single();

    // In production, integrate with Nagad Payment Gateway API
    // For now, return mock response
    const nagadUrl = `https://nagad.example.com/payment?txId=${transaction.id}`;

    return new Response(
      JSON.stringify({ 
        paymentUrl: nagadUrl,
        transactionId: transaction.id,
        message: 'Nagad integration requires NAGAD_MERCHANT_ID and NAGAD_MERCHANT_KEY to be configured'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Nagad payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
