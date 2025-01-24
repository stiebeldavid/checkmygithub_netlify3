import { serve } from "https://deno.fresh.dev/server";

serve(async (req) => {
  const githubSecret = Deno.env.get("GITHUB_CLIENT_SECRET");
  
  if (!githubSecret) {
    return new Response(
      JSON.stringify({ error: "GitHub secret not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ secret: githubSecret }),
    { headers: { "Content-Type": "application/json" } }
  );
});