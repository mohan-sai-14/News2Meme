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
    const { text, type } = await req.json();
    console.log('Generating caption for:', text, 'Type:', type);

    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY not configured');
    }

    // Create a prompt for generating meme captions
    const prompt = type === 'news' 
      ? `Create a funny, witty meme caption for this news headline. Keep it short (max 100 characters), punchy, and internet-humor friendly. Headline: "${text}"`
      : `Create a hilarious meme caption based on this idea. Keep it short (max 100 characters), punchy, and make it meme-worthy. Idea: "${text}"`;

    // Use Hugging Face's new router endpoint for text generation
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.9,
            top_p: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Hugging Face response:', result);

    let caption = '';
    if (Array.isArray(result) && result[0]?.generated_text) {
      caption = result[0].generated_text.replace(prompt, '').trim();
      // Clean up the caption - take first line or sentence
      caption = caption.split('\n')[0].split('.')[0].trim();
      // Remove quotes if present
      caption = caption.replace(/^["']|["']$/g, '');
    } else {
      // Fallback caption
      caption = type === 'news' 
        ? 'When you read the news and can\'t even...'
        : 'That feeling when...';
    }

    return new Response(
      JSON.stringify({ caption }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-caption:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
