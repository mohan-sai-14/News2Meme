import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching meme templates...');

    // Fetch popular meme templates from Imgflip
    const response = await fetch('https://api.imgflip.com/get_memes');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imgflip API error:', response.status, errorText);
      throw new Error(`Imgflip API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched', data.data?.memes?.length, 'templates');

    if (!data.success) {
      throw new Error('Failed to fetch meme templates');
    }

    // Return top 20 most popular templates
    const templates = data.data.memes.slice(0, 20).map((meme: any) => ({
      id: meme.id,
      name: meme.name,
      url: meme.url,
      width: meme.width,
      height: meme.height,
      boxCount: meme.box_count,
    }));

    return new Response(
      JSON.stringify({ templates }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-meme-templates:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
