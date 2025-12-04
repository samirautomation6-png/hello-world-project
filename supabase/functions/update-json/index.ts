import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

  try {
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
    if (!GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing GitHub token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, owner, repo, path, branch = 'main' } = await req.json();

    if (!data || !owner || !repo || !path) {
      console.error('Missing required fields:', { data: !!data, owner, repo, path });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: data, owner, repo, path' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updating ${owner}/${repo}/${path} on branch ${branch}`);

    // Get the current file SHA (required for updates)
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Lovable-App',
        },
      }
    );

    let sha = '';
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
      console.log('Found existing file with SHA:', sha);
    } else {
      const errorText = await getFileResponse.text();
      console.log('File does not exist or error getting file:', getFileResponse.status, errorText);
    }

    // Encode the content to base64
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    // Update or create the file
    const updatePayload: Record<string, string> = {
      message: `Update league data - ${new Date().toISOString()}`,
      content,
      branch,
    };

    if (sha) {
      updatePayload.sha = sha;
    }

    console.log('Sending update to GitHub...');
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Lovable-App',
        },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('GitHub API error:', updateResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `GitHub API error: ${updateResponse.status}`, details: errorText }),
        { status: updateResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await updateResponse.json();
    console.log('Successfully updated file:', result.content?.sha);

    return new Response(
      JSON.stringify({ success: true, sha: result.content?.sha }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-json function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
