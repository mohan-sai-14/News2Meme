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
    const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY');
    if (!NEWS_API_KEY) {
      throw new Error('NEWS_API_KEY not configured');
    }

    console.log('Fetching trending news...');

    // Fetch top headlines from NewsAPI
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NewsAPI error:', response.status, errorText);
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched', data.articles?.length, 'articles');

    // Format the articles for the frontend
    const headlines = data.articles?.map((article: any) => ({
      title: article.title,
      description: article.description,
      source: article.source?.name,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
    })) || [];

    return new Response(
      JSON.stringify({ headlines }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-news:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
