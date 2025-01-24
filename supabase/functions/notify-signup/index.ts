import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userEmail: string;
  repoUrl?: string;
  pricingOption?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, repoUrl, pricingOption }: EmailRequest = await req.json();
    console.log(`Sending notification for new signup: ${userEmail}${repoUrl ? ` with repo: ${repoUrl}` : ''}${pricingOption ? ` and pricing option: ${pricingOption}` : ''}`);

    const pricingSection = pricingOption ? `
      <p><strong>Selected Plan:</strong> ${pricingOption}</p>
    ` : '';

    const repoSection = repoUrl ? `
      <p><strong>Repository URL:</strong> ${repoUrl}</p>
    ` : '';

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CheckMyGitHub <onboarding@resend.dev>",
        to: ["stiebeldavid@gmail.com"],
        subject: "New User Signup!",
        html: `
          <h2>New User Signup</h2>
          <p>A new user has signed up for CheckMyGitHub:</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          ${pricingSection}
          ${repoSection}
        `,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      const error = await res.text();
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: any) {
    console.error("Error in notify-signup function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);