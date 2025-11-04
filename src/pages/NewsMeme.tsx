import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";

const NewsMeme = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 py-12 mx-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              News-Based Memes
            </h1>
            <p className="text-lg text-muted-foreground">
              Generate memes from trending news headlines
            </p>
          </div>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This feature will allow you to generate memes from trending news headlines. 
                Stay tuned for updates!
              </p>
              <Button variant="hero" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsMeme;
