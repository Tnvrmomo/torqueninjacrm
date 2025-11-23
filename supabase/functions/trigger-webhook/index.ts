import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventType, data, companyId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all active webhooks for this company subscribed to this event
    const { data: webhooks, error: webhookError } = await supabase
      .from("webhooks")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .contains("events", [eventType]);

    if (webhookError) throw webhookError;

    const results = [];

    for (const webhook of webhooks || []) {
      try {
        const payload = {
          event: eventType,
          timestamp: new Date().toISOString(),
          data,
        };

        // Sign the payload if secret key exists
        let signature = "";
        if (webhook.secret_key) {
          const encoder = new TextEncoder();
          const keyData = encoder.encode(webhook.secret_key);
          const payloadData = encoder.encode(JSON.stringify(payload));
          const key = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const signatureBuffer = await crypto.subtle.sign("HMAC", key, payloadData);
          signature = Array.from(new Uint8Array(signatureBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        }

        // Send webhook
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": eventType,
          },
          body: JSON.stringify(payload),
        });

        const responseBody = await response.text();

        // Log the webhook call
        await supabase.from("webhook_logs").insert([
          {
            webhook_id: webhook.id,
            event_type: eventType,
            payload,
            response_status: response.status,
            response_body: responseBody.substring(0, 1000),
            error: response.ok ? null : `HTTP ${response.status}`,
          },
        ]);

        // Update last triggered time
        await supabase
          .from("webhooks")
          .update({ last_triggered_at: new Date().toISOString() })
          .eq("id", webhook.id);

        results.push({
          webhook_id: webhook.id,
          status: response.status,
          success: response.ok,
        });
      } catch (error: any) {
        console.error(`Error triggering webhook ${webhook.id}:`, error);
        
        // Log the error
        await supabase.from("webhook_logs").insert([
          {
            webhook_id: webhook.id,
            event_type: eventType,
            payload: { event: eventType, data },
            error: error.message,
          },
        ]);

        results.push({
          webhook_id: webhook.id,
          error: error.message,
          success: false,
        });
      }
    }

    return new Response(
      JSON.stringify({ triggered: results.length, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in trigger-webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
