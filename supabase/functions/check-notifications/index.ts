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

    console.log("Running notification checks...");

    // Execute all notification check functions
    const { error: lowStockError } = await supabase.rpc('check_low_stock_notifications');
    if (lowStockError) {
      console.error("Error checking low stock:", lowStockError);
    } else {
      console.log("Low stock check completed");
    }

    const { error: overdueError } = await supabase.rpc('check_overdue_invoices');
    if (overdueError) {
      console.error("Error checking overdue invoices:", overdueError);
    } else {
      console.log("Overdue invoice check completed");
    }

    const { error: expiryError } = await supabase.rpc('check_subscription_expiry');
    if (expiryError) {
      console.error("Error checking subscription expiry:", expiryError);
    } else {
      console.log("Subscription expiry check completed");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Notification checks completed",
        errors: {
          lowStock: lowStockError?.message,
          overdue: overdueError?.message,
          expiry: expiryError?.message
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Notification check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
