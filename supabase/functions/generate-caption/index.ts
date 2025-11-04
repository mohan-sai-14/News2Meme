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
    const systemPrompt = type === 'news' 
      ? 'You are a witty meme caption generator. Create short, punchy, internet-humor friendly captions (max 100 characters).'
      : 'You are a hilarious meme caption creator. Make captions that are meme-worthy, short and punchy (max 100 characters).';
    
    const userPrompt = type === 'news'
      ? `Make a funny meme caption for this headline: "${text}"`
      : `Make a hilarious meme caption for: "${text}"`;

    // Use Hugging Face's OpenAI-compatible API endpoint
    const response = await fetch(
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 100,
          temperature: 0.9,
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
    if (result.choices && result.choices[0]?.message?.content) {
      caption = result.choices[0].message.content.trim();
      // Clean up the caption - remove quotes if present
      caption = caption.replace(/^["']|["']$/g, '');
      // Limit length
      if (caption.length > 100) {
        caption = caption.substring(0, 97) + '...';
      }
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
