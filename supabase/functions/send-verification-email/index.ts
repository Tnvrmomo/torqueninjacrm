import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl } = await req.json();
    
    console.log("Sending verification email to:", email);

    const { data, error } = await resend.emails.send({
      from: "TorqueNinja Sales <noreply@torqueninja.com>",
      to: [email],
      subject: "Verify Your TorqueNinja Account ✅",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #000 0%, #870f13 100%); color: white; padding: 40px 30px; text-align: center; }
            .logo { max-width: 180px; height: auto; margin-bottom: 20px; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: #eb020a; color: white !important; padding: 14px 40px; text-decoration: none; border-radius: 5px; margin: 25px 0; font-weight: bold; font-size: 16px; }
            .button:hover { background: #c70108; }
            .footer { background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
            .footer-logo { max-width: 120px; height: auto; margin-bottom: 15px; opacity: 0.7; }
            .footer-text { color: #666; font-size: 12px; line-height: 1.8; }
            .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://crm.torquesticker.com/logo.png" alt="TorqueNinja" class="logo" />
              <h1 style="margin: 0; font-size: 28px;">Verify Your Email Address</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #eb020a; margin-top: 0;">Welcome to TorqueNinja! 🚀</h2>
              
              <p>Thank you for signing up! We're excited to have you onboard.</p>
              
              <p><strong>To get started with your 7-day free trial, please verify your email address by clicking the button below:</strong></p>
              
              <p style="text-align: center;">
                <a href="${confirmationUrl}" class="button">Verify Email Address</a>
              </p>
              
              <div class="highlight">
                <strong>⏰ Quick action required!</strong><br>
                This verification link will expire in 24 hours for security purposes.
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
                <a href="${confirmationUrl}" style="color: #eb020a; word-break: break-all;">${confirmationUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #999; margin-top: 30px;">
                If you didn't create a TorqueNinja account, you can safely ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <img src="https://crm.torquesticker.com/logo.png" alt="TorqueNinja" class="footer-logo" />
              <div class="footer-text">
                <strong>TorqueNinja</strong><br>
                Complete Business Management for Auto Parts & Beyond<br>
                © 2024 TorqueNinja. All rights reserved.<br><br>
                Need help? Contact us at <a href="mailto:support@torqueninja.com" style="color: #eb020a;">support@torqueninja.com</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verification email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
