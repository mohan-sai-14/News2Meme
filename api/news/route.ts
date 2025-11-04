import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'general';
  const country = searchParams.get('country') || 'us';
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '6';

  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  
  if (!GNEWS_API_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    // Build the GNews API URL
    let apiUrl = `https://gnews.io/api/v4/top-headlines?apikey=${GNEWS_API_KEY}&lang=en&max=${pageSize}&page=${page}`;
    
    // Add filters if provided
    if (searchQuery) {
      apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
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
      return NextResponse.json(
        { error: data.message || 'Failed to fetch news' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
