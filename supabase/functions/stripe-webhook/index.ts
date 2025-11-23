import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret!);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Stripe webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const subscriptionId = session.metadata?.subscription_id;
        const companyId = session.metadata?.company_id;
        
        if (subscriptionId && companyId) {
          // Update subscription status
          const { error: subError } = await supabase
            .from("company_subscriptions")
            .update({ 
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              amount_paid: session.amount_total ? session.amount_total / 100 : 0,
              payment_method: "stripe"
            })
            .eq("id", subscriptionId);

          if (subError) {
            console.error("Error updating subscription:", subError);
          }

          // Create payment transaction
          const { error: txError } = await supabase.from("payment_transactions").insert({
            company_id: companyId,
            subscription_id: subscriptionId,
            amount_usd: session.amount_total ? session.amount_total / 100 : 0,
            currency: "USD",
            payment_method: "stripe",
            payment_gateway_id: session.id,
            status: "completed"
          });

          if (txError) {
            console.error("Error creating transaction:", txError);
          }

          console.log("Subscription activated:", subscriptionId);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as any;
        console.error("Payment failed:", paymentIntent.id, paymentIntent.last_payment_error);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        console.log("Subscription updated:", subscription.id, subscription.status);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        console.log("Subscription cancelled:", subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
