import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY");
    const MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN");
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      return new Response(JSON.stringify({ error: "Mailgun not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { campaign_id, lead_ids } = await req.json();
    if (!campaign_id) {
      return new Response(JSON.stringify({ error: "campaign_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("lead_campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get leads to email
    let leadsQuery = supabase.from("leads").select("*").eq("company_id", campaign.company_id);
    if (lead_ids && lead_ids.length > 0) {
      leadsQuery = leadsQuery.in("id", lead_ids);
    }
    const { data: leads, error: leadsError } = await leadsQuery;

    if (leadsError || !leads || leads.length === 0) {
      return new Response(JSON.stringify({ error: "No leads with email addresses found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter leads with valid emails
    const emailableLeads = leads.filter((l: any) => l.email && l.email.includes("@"));
    if (emailableLeads.length === 0) {
      return new Response(JSON.stringify({ error: "No leads with valid email addresses" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update campaign status
    await supabase
      .from("lead_campaigns")
      .update({ status: "sending", total_recipients: emailableLeads.length })
      .eq("id", campaign_id);

    let sentCount = 0;
    let failedCount = 0;
    const campaignEmails: any[] = [];

    for (const lead of emailableLeads) {
      try {
        // Personalize email body
        const personalizedHtml = campaign.body_html
          .replace(/\{\{name\}\}/g, lead.name || lead.company_name || "there")
          .replace(/\{\{company\}\}/g, lead.company_name || "your company")
          .replace(/\{\{email\}\}/g, lead.email);

        const personalizedText = (campaign.body_text || "")
          .replace(/\{\{name\}\}/g, lead.name || lead.company_name || "there")
          .replace(/\{\{company\}\}/g, lead.company_name || "your company");

        // Send via Mailgun
        const formData = new FormData();
        formData.append("from", `${campaign.from_name || "TorqueNinja"} <${campaign.from_email || `noreply@${MAILGUN_DOMAIN}`}>`);
        formData.append("to", lead.email);
        formData.append("subject", campaign.subject);
        formData.append("html", personalizedHtml);
        if (personalizedText) formData.append("text", personalizedText);
        formData.append("o:tracking", "yes");
        formData.append("o:tracking-clicks", "yes");
        formData.append("o:tracking-opens", "yes");

        const mgResponse = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
          },
          body: formData,
        });

        const mgData = await mgResponse.json();

        if (mgResponse.ok) {
          sentCount++;
          campaignEmails.push({
            campaign_id,
            lead_id: lead.id,
            status: "sent",
            sent_at: new Date().toISOString(),
            mailgun_message_id: mgData.id || null,
          });
        } else {
          failedCount++;
          campaignEmails.push({
            campaign_id,
            lead_id: lead.id,
            status: "failed",
            error_message: mgData.message || "Send failed",
          });
        }
      } catch (emailError) {
        failedCount++;
        campaignEmails.push({
          campaign_id,
          lead_id: lead.id,
          status: "failed",
          error_message: emailError instanceof Error ? emailError.message : "Unknown error",
        });
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Insert campaign email records
    if (campaignEmails.length > 0) {
      await supabase.from("campaign_emails").insert(campaignEmails);
    }

    // Update campaign stats
    await supabase
      .from("lead_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        total_sent: sentCount,
        total_bounced: failedCount,
      })
      .eq("id", campaign_id);

    return new Response(JSON.stringify({
      success: true,
      total: emailableLeads.length,
      sent: sentCount,
      failed: failedCount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Campaign error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
