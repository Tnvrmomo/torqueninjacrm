import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, planName, trialEndsAt } = await req.json();
    
    const { data, error } = await resend.emails.send({
      from: "TorqueNinja <onboarding@torqueninja.com>",
      to: email,
      subject: "Welcome to TorqueNinja! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #870f13 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #eb020a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .features { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .feature-item { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to TorqueNinja! 🎉</h1>
              <p>Your Complete Business Management Platform</p>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>Thank you for signing up for TorqueNinja <strong>${planName}</strong> plan.</p>
              <p>Your <strong>7-day free trial</strong> is now active until ${new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
              
              <div class="features">
                <h3>🚀 Get Started:</h3>
                <div class="feature-item">✅ Create your first invoice</div>
                <div class="feature-item">📦 Add products to your inventory</div>
                <div class="feature-item">👥 Import your client list</div>
                <div class="feature-item">💬 Chat with our AI assistant for insights</div>
                <div class="feature-item">📊 View business analytics on your dashboard</div>
              </div>

              <p style="text-align: center;">
                <a href="https://crm.torquesticker.com/dashboard" class="button">Go to Dashboard</a>
              </p>

              <p><strong>Need help?</strong> Our AI assistant is available 24/7 to answer questions and provide business insights.</p>
              
              <p>Best regards,<br>The TorqueNinja Team</p>
            </div>
            <div class="footer">
              <p>TorqueNinja - Complete Business Management for Auto Parts & Beyond</p>
              <p>© 2024 TorqueNinja. All rights reserved.</p>
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Welcome email sent:", data);
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Email error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
