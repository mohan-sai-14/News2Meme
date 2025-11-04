import React, { useState, useEffect, useMemo } from 'react';
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedHeadline, setSelectedHeadline] = useState<Article | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [caption, setCaption] = useState('');
  const [currentTemplate, setCurrentTemplate] = useState(getRandomTemplate());
  const [generatedMeme, setGeneratedMeme] = useState('');
  const itemsPerPage = 6;
  const { toast } = useToast();

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

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (loadMore = false) => {
    const currentPage = loadMore ? page + 1 : 1;
    
    // Don't fetch more if we're already loading or have no more to load
    if ((loadMore && (!hasMore || isLoadingMore)) || isLoading) return;

    try {
      // Set loading state
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
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
            
        toast({
          title: "Error Loading News",
          description: `Failed to load news. ${errorMessage}`,
          variant: "destructive"
        });
        
        console.error('Full error object:', error);
        // Fall through to sample data
      }
      
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
      
    } catch (error: any) {
      console.error('Error in fetchNews:', error);
      toast({
        title: "Using Sample Data",
        description: error?.message || "Could not connect to news service. Using sample data instead.",
        variant: "destructive",
      });
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

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchNews(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-heading font-bold">
                News-Based Memes
              </h1>
              <p className="text-muted-foreground">
                Generate memes from trending news headlines
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoadingNews}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingNews && !isLoadingMore ? 'animate-spin' : ''}`} />
                {isLoadingNews && !isLoadingMore ? 'Refreshing...' : 'Refresh News'}
              </Button>
              <Link to="/" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  Change Filters
                </Button>
              </Link>
            </div>
          </div>

          {isLoadingNews ? (
            <Card className="shadow-medium">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading trending news...</p>
                </div>
              </CardContent>
            </Card>
          ) : generatedMeme ? (
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Your Generated Meme</CardTitle>
                <CardDescription>
                  Based on: {selectedHeadline?.title}
                </CardDescription>
                {caption && (
                  <CardDescription className="text-base font-medium mt-2">
                    Caption: {caption}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {currentTemplate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ImageIcon className="w-4 h-4" />
                      <span>Template: {currentTemplate.name}</span>
                    </div>
                  )}
                  <div className="relative rounded-lg overflow-hidden shadow-large border">
                    <img 
                      src={generatedMeme} 
                      alt="Generated meme" 
                      className="w-full h-auto"
                    />
                  </div>
                  <Button 
                    onClick={() => handleGenerateMeme(selectedHeadline!)} 
                    variant="outline" 
                    className="w-full gap-2"
                    disabled={isGenerating}
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : 'Try Different Template'}
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={handleDownload}
                    className="flex-1 gap-2"
                    variant="hero"
                  >
                    <Download className="w-4 h-4" />
                    Download Meme
                  </Button>
                  <Button 
                    onClick={() => {
                      setGeneratedMeme(null);
                      setSelectedHeadline(null);
                      setCaption("");
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Choose Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {headlines.map((headline, index) => (
                <Card 
                  key={index} 
                  className="shadow-medium hover:shadow-large transition-smooth cursor-pointer group"
                  onClick={() => !isGenerating && handleGenerateMeme(headline)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Newspaper className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-base leading-tight group-hover:text-primary transition-smooth">
                          {headline.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{headline.source}</span>
                          <span>•</span>
                          <span>{new Date(headline.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="hero" 
                      className="w-full gap-2"
                      disabled={isGenerating}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateMeme(headline);
                      }}
                    >
                      {isGenerating && selectedHeadline?.title === headline.title ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Meme
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {/* Load More Button */}
              <div className="col-span-full flex justify-center mt-6">
                {hasMore ? (
                  <Button 
                    onClick={handleLoadMore} 
                    disabled={isLoadingMore}
                    variant="outline"
                    className="gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Headlines'
                    )}
                  </Button>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No more headlines to load
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsMeme;
