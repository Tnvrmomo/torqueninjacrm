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
    const { analysisType } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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

    // Fetch business data
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, status, created_at')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: products } = await supabase
      .from('products')
      .select('name, stock_quantity, sale_price, cost_price')
      .eq('company_id', profile.company_id)
      .limit(50);

    let prompt = '';
    switch (analysisType) {
      case 'sales_trends':
        prompt = `Analyze these invoice trends and provide insights on sales performance: ${JSON.stringify(invoices?.slice(0, 20))}`;
        break;
      case 'inventory_analysis':
        prompt = `Analyze this inventory and suggest optimization strategies: ${JSON.stringify(products?.slice(0, 20))}`;
        break;
      case 'profit_loss':
        prompt = `Analyze profit margins based on this data: ${JSON.stringify({ invoices: invoices?.slice(0, 10), products: products?.slice(0, 10) })}`;
        break;
      default:
        prompt = `Provide business insights based on this data: Invoices: ${invoices?.length}, Products: ${products?.length}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a business analytics expert. Provide actionable insights in a concise format.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('AI Gateway error');
    }

    const data = await response.json();

    // Track AI usage
    await supabase.from('ai_usage').insert({
      company_id: profile.company_id,
      user_id: user.id,
      usage_type: 'analytics',
      tokens_used: 500,
      cost_bdt: 2.5,
      cost_usd: 0.025
    });

    return new Response(
      JSON.stringify({ insights: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
