// Use the correct Deno serve import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const githubSecret = Deno.env.get("GITHUB_CLIENT_SECRET");
  const githubClientId = "Ov23lilzhuwxnMiXDPq6";
  
  if (!githubSecret) {
    console.error("GitHub secret not configured");
    return new Response(
      JSON.stringify({ error: "GitHub secret not configured" }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }

  console.log("Returning GitHub credentials");
  return new Response(
    JSON.stringify({ 
      secret: githubSecret,
      clientId: githubClientId 
    }),
    { 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    }
  );
});