import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Secret detection patterns
const secretPatterns = [
  {
    name: 'Generic API Key',
    regex: /(?i)(api[_-]?key|apikey)(["\s]*[:=])(["\s]*)([a-z0-9]{32,45})/g,
  },
  {
    name: 'AWS Access Key',
    regex: /AKIA[0-9A-Z]{16}/g,
  },
  {
    name: 'GitHub Token',
    regex: /gh[ps]_[0-9a-zA-Z]{36}/g,
  },
  {
    name: 'Generic Secret',
    regex: /(?i)(secret|password|token)(["\s]*[:=])(["\s]*)([a-z0-9]{32,45})/g,
  },
  {
    name: 'Private Key',
    regex: /-----BEGIN PRIVATE KEY-----/g,
  },
  {
    name: 'RSA Private Key',
    regex: /-----BEGIN RSA PRIVATE KEY-----/g,
  },
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { repoUrl } = await req.json()
    console.log('Processing request for repo:', repoUrl)
    
    if (!repoUrl) {
      throw new Error('No repository URL provided')
    }

    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub repository URL')
    }

    const [, owner, repo] = match
    const repoName = repo.replace(/\.git\/?$/, '')

    console.log(`Scanning repository: ${owner}/${repoName}`)

    // Get GitHub token from request headers
    const githubToken = req.headers.get('Authorization')?.split(' ')[1]
    if (!githubToken) {
      console.log('No GitHub token provided')
    }

    // Fetch repository contents using GitHub API
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/main?recursive=1`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': githubToken ? `token ${githubToken}` : '',
      },
    })

    if (!response.ok) {
      console.error('GitHub API error:', response.status, await response.text())
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const data = await response.json()
    const results = []

    // Only scan text-based files
    const textFileExtensions = ['.js', '.ts', '.json', '.yml', '.yaml', '.env', '.txt', '.md', '.jsx', '.tsx']

    // Scan each file
    for (const file of data.tree) {
      if (file.type === 'blob' && textFileExtensions.some(ext => file.path.toLowerCase().endsWith(ext))) {
        console.log('Scanning file:', file.path)
        
        // Fetch file content
        const contentResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': githubToken ? `token ${githubToken}` : '',
          },
        })

        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          const content = atob(contentData.content)

          // Check for secrets
          for (const pattern of secretPatterns) {
            const matches = [...content.matchAll(pattern.regex)]
            if (matches.length > 0) {
              results.push({
                file: file.path,
                ruleID: pattern.name,
                matches: matches.length,
              })
            }
          }
        } else {
          console.error('Error fetching file content:', file.path, contentResponse.status)
        }
      }
    }

    console.log('Scan completed. Found', results.length, 'potential secrets')

    return new Response(
      JSON.stringify({ results }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
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