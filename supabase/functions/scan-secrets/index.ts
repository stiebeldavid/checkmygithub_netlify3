import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { repoUrl } = await req.json()
    
    if (!repoUrl) {
      throw new Error('No repository URL provided')
    }

    console.log('Starting Gitleaks scan for:', repoUrl)

    // Extract repo info from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub repository URL')
    }

    const [, owner, repo] = match
    const repoName = repo.replace(/\.git\/?$/, '')

    // Create a temporary directory for the clone
    const tempDir = await Deno.makeTempDir()
    
    try {
      // Clone the repository
      const cloneProcess = new Deno.Command('git', {
        args: ['clone', `https://github.com/${owner}/${repoName}.git`, tempDir],
      })
      const cloneOutput = await cloneProcess.output()
      
      if (!cloneOutput.success) {
        throw new Error('Failed to clone repository')
      }

      // Run gitleaks
      const gitleaksProcess = new Deno.Command('gitleaks', {
        args: ['detect', '--source', tempDir, '--report-format', 'json'],
      })
      const gitleaksOutput = await gitleaksProcess.output()
      
      // Parse the JSON output
      const textDecoder = new TextDecoder()
      const results = textDecoder.decode(gitleaksOutput.stdout)

      return new Response(
        JSON.stringify({ results }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } finally {
      // Clean up: remove the temporary directory
      try {
        await Deno.remove(tempDir, { recursive: true })
      } catch (error) {
        console.error('Error cleaning up temp directory:', error)
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})