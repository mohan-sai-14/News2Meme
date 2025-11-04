import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const {
    q = '',
    category = 'general',
    country = 'us',
    page = '1',
    pageSize = '6'
  } = req.query;

  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  
  if (!GNEWS_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Build the GNews API URL
    let apiUrl = `https://gnews.io/api/v4/top-headlines?apikey=${GNEWS_API_KEY}&lang=en&max=${pageSize}&page=${page}`;
    
    // Add filters if provided
    if (q) {
      apiUrl += `&q=${encodeURIComponent(q as string)}`;
    }
    if (category && category !== 'all') {
      apiUrl += `&category=${category}`;
    }
    if (country) {
      apiUrl += `&country=${country}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || 'Failed to fetch news' 
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
