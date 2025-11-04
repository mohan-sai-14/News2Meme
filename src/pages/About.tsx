import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 py-12 mx-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              About AI Meme Generator
            </h1>
            <p className="text-lg text-muted-foreground">
              Creating laughter through the power of artificial intelligence
            </p>
          </div>

          <div className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  What We Do
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  AI Meme Generator is a cutting-edge web application that leverages artificial intelligence 
                  to automatically create humorous memes from trending news headlines or custom user input. 
                  We combine real-time news data with AI-powered caption generation to produce shareable, 
                  downloadable memes that capture current events and user creativity in an entertaining format.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                  <li>Choose to generate from trending news or create a custom meme</li>
                  <li>Our AI analyzes your input and generates witty captions</li>
                  <li>Select from various meme templates or let AI choose the best one</li>
                  <li>Preview, customize, and download your meme</li>
                  <li>Share your creation with the world!</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-accent" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We believe laughter is universal, and memes are the language of the internet. 
                  Our mission is to democratize meme creation by making it accessible to everyone, 
                  regardless of their design skills or creative experience. With AI as your creative 
                  partner, anyone can become a meme master.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
