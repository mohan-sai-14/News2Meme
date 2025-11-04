import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Loader2, Sparkles, Download, RefreshCw, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewsHeadline {
  title: string;
  description: string;
  source: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
}

const NewsMeme = () => {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedHeadline, setSelectedHeadline] = useState<NewsHeadline | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [currentTemplate, setCurrentTemplate] = useState<{id: string, name: string} | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 6;

  // Popular meme templates with their IDs and text configurations
  const memeTemplates = [
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
  ];

  // Get a random meme template
  const getRandomTemplate = () => {
    return memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
  };
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingNews(true);
      setPage(1);
    }

    try {
      // Get URL parameters for filters
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('q') || '';
      const category = urlParams.get('category') || 'all';
      const country = urlParams.get('country') || 'us';
      const currentPage = loadMore ? page + 1 : 1;
      const pageSize = 6; // Number of articles per page

      // Build our API URL
      let apiUrl = `/api/news?page=${currentPage}&pageSize=${pageSize}`;
      
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

      try {
        console.log('Fetching news from:', apiUrl);
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error Response:', errorData);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data && Array.isArray(data.articles)) {
          const formattedHeadlines = data.articles.map((article: any) => ({
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
            setHasMore(formattedHeadlines.length === pageSize);
          } else {
            setHeadlines(formattedHeadlines);
            setHasMore(formattedHeadlines.length === pageSize);
          }
          return;
        } else {
          const errorMsg = data.message || data.errors?.[0]?.message || 'No articles found';
          console.error('API Error:', errorMsg);
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error('Error fetching from News API:', error);
        toast({
          title: "Error",
          description: `Failed to load news: ${error.message}`,
          variant: "destructive"
        });
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
