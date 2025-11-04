import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Loader2, Sparkles, Download, RefreshCw, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsHeadline {
  title: string;
  description: string;
  source: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
}

interface Article {
  title: string;
  description: string;
  source: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
}

// Move getRandomTemplate function before the component
const getRandomTemplate = () => {
  const memeTemplates = [
    { id: '181913649', name: 'Drake Hotline Bling', topText: true, bottomText: true },
    { id: '87743020', name: 'Two Buttons', topText: true, bottomText: true },
    { id: '112126428', name: 'Distracted Boyfriend', topText: true, bottomText: true },
    { id: '131087935', name: 'Running Away Balloon', topText: true, bottomText: false },
    { id: '124822590', name: 'Left Exit 12 Off Ramp', topText: true, bottomText: true },
    { id: '247375501', name: 'Buff Doge vs. Cheems', topText: true, bottomText: true },
  ];
  return memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
};

const NewsMeme = () => {
  const [headlines, setHeadlines] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedHeadline, setSelectedHeadline] = useState<Article | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [caption, setCaption] = useState('');
  const [currentTemplate, setCurrentTemplate] = useState(getRandomTemplate());
  const [generatedMeme, setGeneratedMeme] = useState('');
  const itemsPerPage = 6;
  // Memoize the meme templates to prevent recreation on every render
  const memeTemplates = useMemo(() => [
    { id: '181913649', name: 'Drake Hotline Bling', topText: true, bottomText: true },
    { id: '87743020', name: 'Two Buttons', topText: true, bottomText: true },
    { id: '112126428', name: 'Distracted Boyfriend', topText: true, bottomText: true },
    { id: '131087935', name: 'Running Away Balloon', topText: true, bottomText: false },
    { id: '124822590', name: 'Left Exit 12 Off Ramp', topText: true, bottomText: true },
    { id: '247375501', name: 'Buff Doge vs. Cheems', topText: true, bottomText: true },
    { id: '129242737', name: 'Change My Mind', topText: false, bottomText: true },
    { id: '102156234', name: 'Mocking Spongebob', topText: true, bottomText: false },
    { id: '93895088', name: 'Expanding Brain', topText: true, bottomText: false },
    { id: '155067746', name: 'Surprised Pikachu', topText: true, bottomText: false }
  ], []);

  const { toast } = useToast();

  interface NewsApiArticle {
    title: string;
    description: string | null;
    source: {
      name: string;
    } | string;
    url: string;
    urlToImage: string | null;
    publishedAt: string | null;
  }

  const fetchNews = useCallback(async (loadMore = false) => {
    const currentPage = loadMore ? page + 1 : 1;
    
    // Don't fetch more if we're already loading or have no more to load
    if ((loadMore && (!hasMore || isLoadingMore)) || isLoading) return;

    try {
      // Set loading state
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setIsLoadingNews(true);
      }

      // Get URL parameters for filters
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('q') || '';
      const category = urlParams.get('category') || 'all';
      const country = urlParams.get('country') || 'us';
      const pageSize = 6; // Number of articles per page

      // Build our API URL
      const baseUrl = import.meta.env.PROD 
        ? 'https://news2meme.vercel.app' 
        : '';
      let apiUrl = `${baseUrl}/api/news?page=${currentPage}&pageSize=${pageSize}`;
      
      // Add filters if provided
      if (searchQuery) {
        apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
      }
      if (category && category !== 'all' && category !== 'All') {
        apiUrl += `&category=${category.toLowerCase()}`;
      }
      if (country) {
        apiUrl += `&country=${country.toLowerCase()}`;
      }

      console.log('Fetching news from:', apiUrl);
      
      console.log('Making API request to:', apiUrl);
      console.log('Making API request to:', apiUrl);
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const responseText = await response.text();
      console.log('API Response Status:', response.status);
      console.log('API Response Text:', responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          console.error('API Error:', errorData);
          throw new Error(
            errorData.message || 
            errorData.error?.message || 
            `API request failed with status ${response.status}`
          );
        } catch (e) {
          console.error('Failed to parse error response:', e);
          throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }
      }
      
      const data = JSON.parse(responseText);
      
      if (!data.articles || !Array.isArray(data.articles)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      // Process the articles
      const formattedHeadlines = data.articles.map((article: NewsApiArticle) => ({
        title: article.title || 'No title available',
        description: article.description || 'No description available',
        source: typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown source',
        url: article.url || article.source?.url || '#',
        urlToImage: article.urlToImage || 'https://via.placeholder.com/300x150?text=No+Image',
        publishedAt: article.publishedAt || new Date().toISOString()
      }));

      if (loadMore) {
        setHeadlines(prev => [...prev, ...formattedHeadlines]);
        setPage(currentPage);
      } else {
        setHeadlines(formattedHeadlines);
      }
      
      setHasMore(formattedHeadlines.length === pageSize);
      
    } catch (error) {
      console.error('Error in fetchNews:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'Unknown error';
          
      // Fallback to sample data if News API fails
      const fallbackData = [
        {
          title: "Sample News Headline 1",
          description: "This is a sample news description. The News API might be rate limited or unavailable.",
          source: "Sample News",
          url: "#",
          urlToImage: "https://via.placeholder.com/300x150?text=News+Image",
          publishedAt: new Date().toISOString()
        },
        {
          title: "Sample News Headline 2",
          description: "Another sample news description. Please check your internet connection and API key.",
          source: "Sample News",
          url: "#",
          urlToImage: "https://via.placeholder.com/300x150?text=News+Image",
          publishedAt: new Date().toISOString()
        }
      ];
      
      if (loadMore) {
        setHeadlines(prev => [...prev, ...fallbackData]);
      } else {
        setHeadlines(fallbackData);
      }
      
      toast({
        title: "Using Sample Data",
        description: `Could not connect to news service. ${errorMessage} Using sample data instead.`,
        variant: "destructive",
      });
      
    } finally {
      setIsLoading(false);
      setIsLoadingNews(false);
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, isLoading, toast]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);


    try {
      // Set loading state
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setIsLoadingNews(true);
      }

      // Get URL parameters for filters
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('q') || '';
      const category = urlParams.get('category') || 'all';
      const country = urlParams.get('country') || 'us';
      const pageSize = 6; // Number of articles per page

      // Build our API URL
      const baseUrl = import.meta.env.PROD 
        ? 'https://news2meme.vercel.app' 
        : '';
      let apiUrl = `${baseUrl}/api/news?page=${currentPage}&pageSize=${pageSize}`;
      
      // Add filters if provided
      if (searchQuery) {
        apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
      }
      if (category && category !== 'all' && category !== 'All') {
        apiUrl += `&category=${category.toLowerCase()}`;
      }
      if (country) {
        apiUrl += `&country=${country.toLowerCase()}`;
      }

      console.log('Fetching news from:', apiUrl);
      
      console.log('Making API request to:', apiUrl);
      console.log('Making API request to:', apiUrl);
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const responseText = await response.text();
      console.log('API Response Status:', response.status);
      console.log('API Response Text:', responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          console.error('API Error:', errorData);
          throw new Error(
            errorData.message || 
            errorData.error?.message || 
            `API request failed with status ${response.status}`
          );
        } catch (e) {
          console.error('Failed to parse error response:', e);
          throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }
      }
      
      const data = JSON.parse(responseText);
      
      if (!data.articles || !Array.isArray(data.articles)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      // Process the articles
      const formattedHeadlines = data.articles.map(article => ({
        title: article.title || 'No title available',
        description: article.description || 'No description available',
        source: article.source?.name || 'Unknown source',
        url: article.url || article.source?.url || '#',
        urlToImage: article.urlToImage || 'https://via.placeholder.com/300x150?text=No+Image',
        publishedAt: article.publishedAt || new Date().toISOString()
      }));

      if (loadMore) {
        setHeadlines(prev => [...prev, ...formattedHeadlines]);
        setPage(currentPage);
      } else {
        setHeadlines(formattedHeadlines);
      }
      
      setHasMore(formattedHeadlines.length === pageSize);
      return;
      
    } catch (error) {
      console.error('Error in fetchNews:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'Unknown error';
          
      // Fallback to sample data if News API fails
      const fallbackData = [
        {
          title: "Sample News Headline 1",
          description: "This is a sample news description. The News API might be rate limited or unavailable.",
          source: "Sample News",
          url: "#",
          urlToImage: "https://via.placeholder.com/300x150?text=News+Image",
          publishedAt: new Date().toISOString()
        },
        {
          title: "Sample News Headline 2",
          description: "Another sample news description. Please check your internet connection and API key.",
          source: "Sample News",
          url: "#",
          urlToImage: "https://via.placeholder.com/300x150?text=News+Image",
          publishedAt: new Date().toISOString()
        }
      ];
      
      if (loadMore) {
        setHeadlines(prev => [...prev, ...fallbackData]);
      } else {
        setHeadlines(fallbackData);
      }
      
      toast({
        title: "Using Sample Data",
        description: `Could not connect to news service. ${errorMessage} Using sample data instead.`,
        variant: "destructive",
      });
      
      console.error('Full error object:', error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const handleGenerateMeme = async (headline: NewsHeadline) => {
    setSelectedHeadline(headline);
    setIsGenerating(true);
    
    try {
      let generatedCaption = headline.title;
      
      // Try to generate caption via Edge Function, fallback to using the headline
      try {
        const { data: captionData, error: captionError } = await supabase.functions
          .invoke('generate-caption', {
            body: { text: headline.title, type: 'news' }
          });
          
        if (!captionError && captionData?.caption) {
          generatedCaption = captionData.caption;
        }
      } catch (error) {
        console.warn('Caption generation failed, using headline as caption');
      }
      
      setCaption(generatedCaption);
      
      // Select a random template
      const template = getRandomTemplate();
      setCurrentTemplate(template);
      
      // Prepare text for the meme
      let topText = '';
      let bottomText = '';
      
      if (template.topText && template.bottomText) {
        // Split the caption for templates with both top and bottom text
        const words = generatedCaption.split(' ');
        const midPoint = Math.ceil(words.length / 2);
        topText = words.slice(0, midPoint).join(' ').substring(0, 50);
        bottomText = words.slice(midPoint).join(' ').substring(0, 50);
      } else if (template.topText) {
        topText = generatedCaption.substring(0, 100);
      } else {
        bottomText = generatedCaption.substring(0, 100);
      }

      // Try to generate meme via Edge Function, fallback to Memegen API
      try {
        const { data: memeData, error: memeError } = await supabase.functions.invoke('create-meme', {
          body: { 
            topText: topText,
            bottomText: bottomText,
            templateId: template.id
          }
        });

        if (!memeError && memeData?.memeUrl) {
          setGeneratedMeme(memeData.memeUrl);
          toast({
            title: `${template.name} Meme Generated!`,
            description: "Your news-based meme is ready",
          });
          return;
        }
      } catch (error) {
        console.warn('Meme generation failed, using fallback');
      }
      
      // Fallback to Memegen API
      const fallbackMemeUrl = `https://api.memegen.link/images/${template.id}/` +
        `${encodeURIComponent(topText || '_')}/` +
        `${encodeURIComponent(bottomText || '')}.png`;
      
      setGeneratedMeme(fallbackMemeUrl);
      toast({
        title: `${template.name} Meme Generated (Demo)`,
        description: "Using demo meme generation service",
      });
    } catch (error: any) {
      console.error('Error generating meme:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate meme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedMeme) {
      window.open(generatedMeme, '_blank');
      toast({
        title: "Opening meme",
        description: "Right-click to save the image",
      });
    }
  };

  const handleRefresh = () => {
    setHeadlines([]);
    fetchNews(false);
  };

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchNews(true);
    }
  }, [isLoadingMore, hasMore, fetchNews]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* News Feed */}
          <div className="w-full md:w-1/2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Latest News</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || isLoadingMore}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : headlines.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No news found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {headlines.map((headline, index) => (
                  <Card
                    key={`${headline.title}-${index}`}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedHeadline?.title === headline.title ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedHeadline(headline)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{headline.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {headline.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{headline.source}</span>
                        <span>{new Date(headline.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Meme Generator */}
          <div className="w-full md:w-1/2">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Meme Generator</h2>

                {!selectedHeadline ? (
                  <div className="text-center py-12">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">Select a news headline to create a meme</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Headline</h3>
                      <p className="text-gray-800 font-medium">{selectedHeadline.title}</p>
                    </div>

                    <div>
                      <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Caption (Optional)
                      </label>
                      <input
                        type="text"
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a funny caption..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meme Template
                      </label>
                      <select
                        value={currentTemplate.id}
                        onChange={(e) => {
                          const selected = memeTemplates.find((t) => t.id === e.target.value);
                          if (selected) setCurrentTemplate(selected);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {memeTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      onClick={() => handleGenerateMeme(selectedHeadline)}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create Meme
                        </>
                      )}
                    </Button>

                    {generatedMeme && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Meme</h3>
                        <div className="relative">
                          <img
                            src={generatedMeme}
                            alt="Generated meme"
                            className="w-full rounded-md border border-gray-200"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                            onClick={handleDownload}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsMeme;
