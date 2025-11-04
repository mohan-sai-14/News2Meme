import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Gallery = () => {
  // Mock gallery data
  const memes = [
    { id: 1, image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7", title: "AI Generated Meme 1" },
    { id: 2, image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b", title: "AI Generated Meme 2" },
    { id: 3, image: "https://images.unsplash.com/photo-1518770660439-4636190af475", title: "AI Generated Meme 3" },
    { id: 4, image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", title: "AI Generated Meme 4" },
    { id: 5, image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d", title: "AI Generated Meme 5" },
    { id: 6, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", title: "AI Generated Meme 6" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 py-12 mx-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Meme Gallery
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore AI-generated memes from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memes.map((meme) => (
              <Card key={meme.id} className="overflow-hidden shadow-medium hover:shadow-large transition-smooth cursor-pointer group">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={meme.image} 
                      alt={meme.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
