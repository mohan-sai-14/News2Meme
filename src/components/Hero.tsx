import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero opacity-10 animate-pulse" />
      
      {/* Content */}
      <div className="container relative z-10 px-4 py-16 mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-soft">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by AI</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-heading font-black leading-tight">
            Turn Ideas Into
            <span className="block mt-2 gradient-hero bg-clip-text text-transparent animate-pulse">
              Viral Memes
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Generate hilarious, AI-powered memes from trending news or your wildest ideas in seconds
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/custom-meme">
              <Button variant="hero" size="lg" className="gap-2 shadow-large hover:shadow-glow transition-all">
                <Zap className="w-5 h-5" />
                Create Custom Meme
              </Button>
            </Link>
            <Link to="/news-meme">
              <Button variant="outline" size="lg" className="gap-2">
                Generate from News
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Memes Generated</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-heading font-bold text-secondary">AI-Powered</div>
              <div className="text-sm text-muted-foreground">Smart Captions</div>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-1">
              <div className="text-3xl md:text-4xl font-heading font-bold text-accent">Instant</div>
              <div className="text-sm text-muted-foreground">Generation Speed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-secondary/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    </section>
  );
};

export default Hero;
