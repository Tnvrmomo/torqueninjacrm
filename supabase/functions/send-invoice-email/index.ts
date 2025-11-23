import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  invoiceId: string;
  to: string;
  cc?: string[];
  bcc?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, to, cc, bcc }: EmailRequest = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, clients(name, email), company_id, invoice_items(*)")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Invoice not found");
    }

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", invoice.company_id)
      .single();

    const formatBDT = (amount: number) => {
      return `৳${parseFloat(amount.toString()).toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const itemsHtml = invoice.invoice_items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatBDT(item.unit_price)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatBDT(item.line_total)}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoice_number}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #870f13, #eb020a); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Invoice ${invoice.invoice_number}</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">${company?.name || "Torque Stickers"}</p>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
          <div style="margin-bottom: 30px;">
            <h2 style="color: #870f13; margin-bottom: 10px;">Bill To:</h2>
            <p style="margin: 5px 0;"><strong>${invoice.clients?.name}</strong></p>
            ${invoice.clients?.email ? `<p style="margin: 5px 0;">${invoice.clients.email}</p>` : ""}
          </div>
          
          <div style="margin-bottom: 30px;">
            <p><strong>Invoice Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString("en-BD")}</p>
            ${invoice.due_date ? `<p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString("en-BD")}</p>` : ""}
            ${invoice.po_number ? `<p><strong>PO Number:</strong> ${invoice.po_number}</p>` : ""}
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-bottom: 30px;">
            <p style="margin: 8px 0;">Subtotal: <strong>${formatBDT(invoice.subtotal)}</strong></p>
            ${invoice.discount > 0 ? `<p style="margin: 8px 0;">Discount: <strong>-${formatBDT(invoice.discount)}</strong></p>` : ""}
            ${invoice.tax_amount > 0 ? `<p style="margin: 8px 0;">VAT (${invoice.tax_rate_1}%): <strong>${formatBDT(invoice.tax_amount)}</strong></p>` : ""}
            <p style="margin: 8px 0; font-size: 20px; color: #870f13; border-top: 2px solid #e5e7eb; padding-top: 8px;">
              Total: <strong>${formatBDT(invoice.total)}</strong>
            </p>
            <p style="margin: 8px 0; font-size: 18px;">
              Balance Due: <strong>${formatBDT(invoice.balance)}</strong>
            </p>
          </div>
          
          ${invoice.public_notes ? `<div style="margin-bottom: 20px;"><p><strong>Notes:</strong></p><p style="color: #666;">${invoice.public_notes}</p></div>` : ""}
          ${invoice.terms_conditions ? `<div style="margin-bottom: 20px;"><p><strong>Terms & Conditions:</strong></p><p style="color: #666; font-size: 14px;">${invoice.terms_conditions}</p></div>` : ""}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 14px;">
            <p>Thank you for your business!</p>
            ${company?.email ? `<p>Contact: ${company.email}</p>` : ""}
            ${company?.phone ? `<p>Phone: ${company.phone}</p>` : ""}
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${company?.name || "Torque Stickers"} <onboarding@resend.dev>`,
        to: [to],
        cc,
        bcc,
        subject: `Invoice ${invoice.invoice_number} from ${company?.name || "Torque Stickers"}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const emailData = await emailResponse.json();

    await supabase
      .from("invoices")
      .update({
        sent_date: new Date().toISOString(),
        status: invoice.status === "draft" ? "sent" : invoice.status,
      })
      .eq("id", invoiceId);

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invoice email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
