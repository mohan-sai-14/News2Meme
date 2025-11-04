import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CustomMeme = () => {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
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
    
    // Simulate meme generation (will be replaced with actual AI integration)
    setTimeout(() => {
      setGeneratedMeme("https://images.unsplash.com/photo-1649972904349-6e44c42644a7");
      setIsGenerating(false);
      toast({
        title: "Meme generated!",
        description: "Your AI-powered meme is ready",
      });
    }, 2000);
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your meme is being downloaded",
    });
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
                        className="w-full aspect-square object-cover"
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
                          setInput("");
                        }}
                        variant="outline"
                        className="flex-1"
                      >
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
