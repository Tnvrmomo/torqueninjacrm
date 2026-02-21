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
    const userId = claims.claims.sub;

    // Get user's company info
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, companies(name, industry)")
      .eq("user_id", userId)
      .single();

    if (!profile?.company_id) {
      return new Response(JSON.stringify({ error: "No company found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { business_category, search_query, location } = await req.json();
    const category = business_category || (profile as any).companies?.industry || "general business";

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: "Firecrawl not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Use Firecrawl search to find potential leads
    const query = search_query || `${category} companies ${location || ""}`.trim();
    console.log("Searching for leads:", query);

    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 10,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    const searchData = await searchResponse.json();
    if (!searchResponse.ok) {
      console.error("Firecrawl search error:", searchData);
      return new Response(JSON.stringify({ error: "Search failed", details: searchData }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = searchData.data || [];
    if (results.length === 0) {
      return new Response(JSON.stringify({ leads: [], message: "No results found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Use AI to extract and categorize lead info from scraped content
    const scrapedContent = results.map((r: any, i: number) => 
      `Result ${i + 1}:\nURL: ${r.url}\nTitle: ${r.title || "N/A"}\nContent: ${(r.markdown || r.description || "").slice(0, 1500)}`
    ).join("\n\n---\n\n");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a lead generation AI. Extract business leads from web scraping results. 
For each potential lead found, extract: name, email, phone, company_name, website, industry, company_size, social_linkedin, social_twitter.
Score each lead 0-100 based on relevance to "${category}" business category.
Categorize each lead (e.g., "Hot Lead", "Warm Lead", "Cold Lead", "Partner Potential").
Add brief notes explaining the scoring rationale.`
          },
          {
            role: "user",
            content: `Extract leads from these search results for a "${category}" business:\n\n${scrapedContent}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_leads",
            description: "Extract structured lead data from scraped content",
            parameters: {
              type: "object",
              properties: {
                leads: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      company_name: { type: "string" },
                      website: { type: "string" },
                      industry: { type: "string" },
                      company_size: { type: "string" },
                      social_linkedin: { type: "string" },
                      social_twitter: { type: "string" },
                      ai_score: { type: "integer" },
                      ai_category: { type: "string" },
                      ai_notes: { type: "string" },
                      source_url: { type: "string" }
                    },
                    required: ["company_name", "ai_score", "ai_category"]
                  }
                }
              },
              required: ["leads"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_leads" } }
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ leads: [], message: "AI could not extract leads" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extractedLeads = JSON.parse(toolCall.function.arguments).leads || [];

    // Step 3: Insert leads into database
    const leadsToInsert = extractedLeads.map((lead: any) => ({
      company_id: profile.company_id,
      name: lead.name || null,
      email: lead.email || null,
      phone: lead.phone || null,
      company_name: lead.company_name,
      website: lead.website || null,
      industry: lead.industry || null,
      company_size: lead.company_size || null,
      social_linkedin: lead.social_linkedin || null,
      social_twitter: lead.social_twitter || null,
      source_url: lead.source_url || null,
      ai_score: Math.min(100, Math.max(0, lead.ai_score || 0)),
      ai_category: lead.ai_category || "Unclassified",
      ai_notes: lead.ai_notes || null,
      status: "new",
    }));

    const { data: insertedLeads, error: insertError } = await supabase
      .from("leads")
      .insert(leadsToInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save leads", details: insertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      leads: insertedLeads, 
      count: insertedLeads?.length || 0,
      message: `Generated ${insertedLeads?.length || 0} leads` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
