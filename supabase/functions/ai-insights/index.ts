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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    console.log("Generating AI business insights...");

    // Get all active companies
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name');

    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify({ message: "No companies found" }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const company of companies) {
      // Get last 7 days of invoices
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentInvoices } = await supabase
        .from('invoices')
        .select('total, status, created_at')
        .eq('company_id', company.id)
        .gte('created_at', sevenDaysAgo);

      // Get top products
      const { data: topProducts } = await supabase
        .from('products')
        .select('name, sale_price, stock_quantity')
        .eq('company_id', company.id)
        .order('sale_price', { ascending: false })
        .limit(5);

      if (!recentInvoices || recentInvoices.length === 0) {
        continue;
      }

      // Generate AI insights using Lovable AI
      const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `Analyze this business data and provide 3 concise insights in bullet points:
            - Recent invoices (last 7 days): ${recentInvoices.length} invoices, total revenue: ৳${recentInvoices.reduce((sum, inv) => sum + inv.total, 0)}
            - Top products: ${topProducts?.map(p => p.name).join(', ')}
            
            Focus on sales trends, opportunities, and recommendations.`
          }],
          max_tokens: 300
        })
      });

      const aiData = await aiResponse.json();
      const insights = aiData.choices?.[0]?.message?.content || "No insights generated";

      // Get first user in company to assign notification
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('company_id', company.id)
        .limit(1)
        .single();

      if (!profile) continue;

      // Create business insight notification
      await supabase.from('notifications').insert({
        company_id: company.id,
        user_id: profile.user_id,
        type: 'business_insight',
        title: 'Weekly Business Insights',
        message: insights,
        entity_type: 'analytics',
        entity_id: null
      });

      // Track AI usage
      await supabase.from('ai_usage').insert({
        company_id: company.id,
        user_id: profile.user_id,
        usage_type: 'business_insights',
        tokens_used: 300,
        cost_bdt: 0.5
      });

      console.log(`Insights generated for company: ${company.name}`);
    }

    return new Response(
      JSON.stringify({ success: true, companiesProcessed: companies.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI insights error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
