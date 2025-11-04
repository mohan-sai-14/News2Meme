import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CustomMeme = () => {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to generate a meme",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Step 1: Generate AI caption
      const { data: captionData, error: captionError } = await supabase.functions.invoke('generate-caption', {
        body: { text: input, type: 'custom' }
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
        description: "Your AI-powered meme is ready",
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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Create Custom Meme
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your idea and let AI create the perfect meme caption
            </p>
          </div>

          {/* Input Section */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Your Meme Idea</CardTitle>
              <CardDescription>
                Describe your meme concept or joke (max 500 characters)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: A cat that thinks it's the CEO of the house..."
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                rows={6}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {input.length}/500 characters
                </span>
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !input.trim()}
                  variant="hero"
                  size="lg"
                  className="gap-2"
                >
                  {isGenerating ? (
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
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {(generatedMeme || isGenerating) && (
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Your Generated Meme</CardTitle>
                {caption && (
                  <CardDescription className="text-base font-medium">
                    Caption: {caption}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                      <p className="text-muted-foreground">AI is creating your meme...</p>
                    </div>
                  </div>
                ) : generatedMeme ? (
                  <div className="space-y-4">
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
                          setCaption("");
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Create Another
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomMeme;
