import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const {
      q = '',
      category = 'general',
      country = 'us',
      page = '1',
      pageSize = '6'
    } = req.query;

    const GNEWS_API_KEY = process.env.GNEWS_API_KEY || 'b20d1f391ec85532c8a6926c208a19f0';
    
    if (!GNEWS_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: Missing API key' });
    }

    // Build the GNews API URL
    const apiUrl = new URL('https://gnews.io/api/v4/top-headlines');
    apiUrl.searchParams.append('apikey', GNEWS_API_KEY);
    apiUrl.searchParams.append('lang', 'en');
    apiUrl.searchParams.append('max', String(pageSize));
    apiUrl.searchParams.append('page', String(page));
    
    // Add filters if provided
    if (q) apiUrl.searchParams.append('q', String(q));
    if (category && category !== 'all') apiUrl.searchParams.append('category', String(category).toLowerCase());
    if (country) apiUrl.searchParams.append('country', String(country).toLowerCase());

    console.log('Fetching from GNews API:', apiUrl.toString());
    
    try {
      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'News2Meme/1.0'
        }
      });
      
      const data = await response.json();
      console.log('GNews API Response:', { 
        status: response.status, 
        statusText: response.statusText,
        hasArticles: !!data.articles,
        articleCount: data.articles?.length || 0
      });
      
      if (!response.ok) {
        console.error('GNews API Error:', data);
        return res.status(response.status).json({ 
          error: data.message || 'Failed to fetch news from GNews API',
          status: response.status,
          details: data
        });
      }
      
      // Transform the response to match our frontend's expected format
      const formattedData = {
        articles: data.articles?.map((article: any) => ({
        title: article.title || 'No title available',
        description: article.description || 'No description available',
        source: {
          name: article.source?.name || 'Unknown source',
          url: article.source?.url || '#'
        },
        url: article.url || '#',
        urlToImage: article.image || 'https://via.placeholder.com/300x150?text=No+Image',
        publishedAt: article.publishedAt || new Date().toISOString()
      })) || [],
      totalResults: data.totalArticles || 0
    };

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error in news API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
