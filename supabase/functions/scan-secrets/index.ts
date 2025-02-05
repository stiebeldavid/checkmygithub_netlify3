import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Enhanced secret detection patterns including TruffleHog's common patterns
const secretPatterns = [
  {
    name: 'Generic API Key',
    regex: /api[_-]?key|apikey["\s]*[:=]["\s]*[a-z0-9]{32,45}/i,
  },
  {
    name: 'AWS Access Key',
    regex: /AKIA[0-9A-Z]{16}/,
  },
  {
    name: 'GitHub Token',
    regex: /gh[ps]_[0-9a-zA-Z]{36}/,
  },
  {
    name: 'Generic Secret',
    regex: /secret|password|token["\s]*[:=]["\s]*[a-z0-9]{32,45}/i,
  },
  {
    name: 'Private Key',
    regex: /-----BEGIN PRIVATE KEY-----/,
  },
  {
    name: 'RSA Private Key',
    regex: /-----BEGIN RSA PRIVATE KEY-----/,
  },
  // Additional TruffleHog patterns
  {
    name: 'AWS Secret Key',
    regex: /(?i)aws.{0,20}(?-i)['\"][0-9a-zA-Z\/+]{40}['\"]/, 
  },
  {
    name: 'Google OAuth',
    regex: /[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com/,
  },
  {
    name: 'Slack Token',
    regex: /xox[baprs]-([0-9a-zA-Z]{10,48})/,
  },
  {
    name: 'Stripe API Key',
    regex: /sk_live_[0-9a-zA-Z]{24}/,
  },
  {
    name: 'Square Access Token',
    regex: /sq0atp-[0-9A-Za-z\-_]{22}/,
  },
  {
    name: 'Square OAuth Secret',
    regex: /sq0csp-[0-9A-Za-z\-_]{43}/,
  },
  {
    name: 'PayPal Braintree Access Token',
    regex: /access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}/,
  },
  {
    name: 'Mailgun API Key',
    regex: /key-[0-9a-zA-Z]{32}/,
  },
  {
    name: 'Mailchimp API Key',
    regex: /[0-9a-f]{32}-us[0-9]{1,2}/,
  },
  {
    name: 'SSH Private Key',
    regex: /-----BEGIN OPENSSH PRIVATE KEY-----/,
  },
  {
    name: 'PGP Private Key',
    regex: /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
  }
]

serve(async (req) => {
  console.log('Received request:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const githubClientId = Deno.env.get('GITHUB_CLIENT_ID');
    const githubSecret = Deno.env.get('GITHUB_CLIENT_SECRET');

    if (!githubClientId || !githubSecret) {
      console.error('Missing GitHub credentials:', { 
        hasClientId: !!githubClientId, 
        hasSecret: !!githubSecret 
      });
      return new Response(
        JSON.stringify({ error: 'GitHub credentials not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let requestData;
    try {
      const contentType = req.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);
      
      if (!rawBody) {
        throw new Error('Empty request body');
      }
      
      requestData = JSON.parse(rawBody);
      console.log('Parsed request data:', requestData);

      if (!requestData.repoUrl) {
        throw new Error('Missing repoUrl in request body');
      }
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: error.message 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { repoUrl } = requestData;
    console.log('Processing request for repo:', repoUrl);

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return new Response(
        JSON.stringify({ error: 'Invalid GitHub repository URL' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git\/?$/, '');
    console.log(`Scanning repository: ${owner}/${repoName}`);

    const authToken = btoa(`${githubClientId}:${githubSecret}`);

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/main?recursive=1`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Basic ${authToken}`,
        'User-Agent': 'Supabase-Edge-Function',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `GitHub API error: ${response.statusText}`,
          details: errorText
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const results = [];
    const textFileExtensions = ['.js', '.ts', '.json', '.yml', '.yaml', '.env', '.txt', '.md', '.jsx', '.tsx'];

    for (const file of data.tree) {
      if (file.type === 'blob' && textFileExtensions.some(ext => file.path.toLowerCase().endsWith(ext))) {
        console.log('Scanning file:', file.path);
        
        try {
          const contentResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `Basic ${authToken}`,
              'User-Agent': 'Supabase-Edge-Function',
            },
          });

          if (contentResponse.ok) {
            const contentData = await contentResponse.json();
            const content = atob(contentData.content);

            for (const pattern of secretPatterns) {
              const matches = content.match(pattern.regex);
              if (matches && matches.length > 0) {
                results.push({
                  file: file.path,
                  ruleID: pattern.name,
                  matches: matches.length,
                  severity: pattern.name.includes('Private Key') || 
                          pattern.name.includes('Secret Key') || 
                          pattern.name.includes('Token') ? 'HIGH' : 'MEDIUM',
                });
              }
            }
          } else {
            console.error('Error fetching file content:', file.path, contentResponse.status);
          }
        } catch (error) {
          console.error('Error processing file:', file.path, error);
        }
      }
    }

    console.log('Scan completed. Found', results.length, 'potential secrets');

    return new Response(
      JSON.stringify({ 
        results,
        scanner: 'TruffleHog-compatible patterns',
        scannedFiles: data.tree.filter(f => textFileExtensions.some(ext => f.path.toLowerCase().endsWith(ext))).length
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in scan-secrets function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
})