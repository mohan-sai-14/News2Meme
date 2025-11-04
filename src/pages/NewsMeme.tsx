import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Loader2, Sparkles, Download, RefreshCw } from "lucide-react";
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
  const [selectedHeadline, setSelectedHeadline] = useState<NewsHeadline | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoadingNews(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      if (error) throw error;
      
      setHeadlines(data.headlines || []);
    } catch (error: any) {
      console.error('Error fetching news:', error);
      toast({
        title: "Failed to load news",
        description: error.message || "Could not fetch trending headlines",
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
      // Step 1: Generate AI caption from headline
      const { data: captionData, error: captionError } = await supabase.functions.invoke('generate-caption', {
        body: { text: headline.title, type: 'news' }
      });

      if (captionError) throw captionError;
      
      const generatedCaption = captionData.caption;
      setCaption(generatedCaption);

      // Step 2: Create meme with the caption
      const { data: memeData, error: memeError } = await supabase.functions.invoke('create-meme', {
        body: { 
          topText: generatedCaption.slice(0, 50),
          bottomText: generatedCaption.length > 50 ? generatedCaption.slice(50, 100) : '',
          templateId: '181913649' // Drake meme template
        }
      });

      if (memeError) throw memeError;

      setGeneratedMeme(memeData.memeUrl);
      toast({
        title: "Meme generated!",
        description: "Your news-based meme is ready",
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 py-12 mx-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              News-Based Memes
            </h1>
            <p className="text-lg text-muted-foreground">
              Generate memes from trending news headlines
            </p>
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
                <div className="relative rounded-lg overflow-hidden shadow-large">
                  <img 
                    src={generatedMeme} 
                    alt="Generated meme" 
                    className="w-full h-auto"
                  />
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
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsMeme;
