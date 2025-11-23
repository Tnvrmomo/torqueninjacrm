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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date().toISOString().split("T")[0];

    // Get recurring invoices that need processing
    const { data: recurringInvoices, error: fetchError } = await supabase
      .from("recurring_invoices")
      .select("*, invoices(*), clients(*)")
      .eq("is_active", true)
      .lte("next_invoice_date", today);

    if (fetchError) throw fetchError;

    const results = [];

    for (const recurring of recurringInvoices || []) {
      try {
        // Get the template invoice
        const template = recurring.invoices;
        if (!template) continue;

        // Create new invoice based on template
        const { data: newInvoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert([
            {
              company_id: recurring.company_id,
              client_id: recurring.client_id,
              invoice_number: `INV-${Date.now()}`,
              issue_date: today,
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              subtotal: template.subtotal,
              discount: template.discount,
              tax_amount: template.tax_amount,
              total: template.total,
              balance: template.total,
              status: recurring.auto_send ? "sent" : "draft",
              sent_date: recurring.auto_send ? new Date().toISOString() : null,
            },
          ])
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Copy invoice items
        const { data: templateItems } = await supabase
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", template.id);

        if (templateItems && templateItems.length > 0) {
          const newItems = templateItems.map((item) => ({
            invoice_id: newInvoice.id,
            product_id: item.product_id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
            line_total: item.line_total,
          }));

          await supabase.from("invoice_items").insert(newItems);
        }

        // Calculate next invoice date
        const nextDate = new Date(recurring.next_invoice_date);
        switch (recurring.frequency) {
          case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "quarterly":
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }

        // Update recurring invoice
        await supabase
          .from("recurring_invoices")
          .update({
            last_sent_date: today,
            next_invoice_date: nextDate.toISOString().split("T")[0],
          })
          .eq("id", recurring.id);

        // Create notification
        await supabase.from("notifications").insert([
          {
            company_id: recurring.company_id,
            type: "invoice_created",
            title: "Recurring Invoice Created",
            message: `Invoice ${newInvoice.invoice_number} created for ${recurring.clients.name}`,
            entity_type: "invoice",
            entity_id: newInvoice.id,
          },
        ]);

        results.push({
          recurring_id: recurring.id,
          invoice_id: newInvoice.id,
          status: "success",
        });
      } catch (error: any) {
        console.error(`Error processing recurring invoice ${recurring.id}:`, error);
        results.push({
          recurring_id: recurring.id,
          status: "error",
          error: error.message,
        });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in process-recurring-invoices:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
