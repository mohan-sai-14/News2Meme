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
    const { topText, bottomText, templateId } = await req.json();
    console.log('Creating meme with template:', templateId);

    const IMGFLIP_USER = Deno.env.get('IMGFLIP_USER');
    const IMGFLIP_PASS = Deno.env.get('IMGFLIP_PASS');

    if (!IMGFLIP_USER || !IMGFLIP_PASS) {
      throw new Error('Imgflip credentials not configured');
    }

    // Use default template if none provided (Drake meme)
    const template = templateId || '181913649';

    // Create meme using Imgflip API
    const formData = new URLSearchParams();
    formData.append('template_id', template);
    formData.append('username', IMGFLIP_USER);
    formData.append('password', IMGFLIP_PASS);
    formData.append('text0', topText || '');
    formData.append('text1', bottomText || '');

    const response = await fetch('https://api.imgflip.com/caption_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imgflip API error:', response.status, errorText);
      throw new Error(`Imgflip API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Imgflip response:', data);

    if (!data.success) {
      throw new Error(data.error_message || 'Failed to create meme');
    }

    return new Response(
      JSON.stringify({ 
        memeUrl: data.data.url,
        pageUrl: data.data.page_url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-meme:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
