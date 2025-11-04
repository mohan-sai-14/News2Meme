import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Search, Globe, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// News categories and countries for filtering
const newsCategories = [
  "All",
  "Business",
  "Entertainment",
  "General",
  "Health",
  "Science",
  "Sports",
  "Technology"
];

const countries = [
  { code: "us", name: "United States" },
  { code: "in", name: "India" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "jp", name: "Japan" },
];

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [showFilters, setShowFilters] = useState(false);
  const [filtersSubmitted, setFiltersSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filtersSubmitted) {
      setFiltersSubmitted(true);
      setShowFilters(true);
    } else {
      // Navigate to news-meme with filters using React Router
      navigate(`/news-meme?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}&country=${selectedCountry}`);
    }
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/80 to-background/40">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl animate-float" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 px-4 py-16 mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-soft animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by AI</span>
          </div>

          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-heading font-black leading-tight">
              Turn Ideas Into
            </h1>
            <div className="relative inline-block">
              <span className="relative z-10 text-5xl md:text-7xl font-heading font-black bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Viral Memes
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/30 to-pink-500/30 blur-2xl rounded-full animate-pulse-slow" />
            </div>
          </div>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Generate hilarious, AI-powered memes from trending news or your wildest ideas in seconds
          </p>

          {/* Search and Filter Section */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for news..."
                className="pl-10 pr-4 py-6 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="button"
                variant="outline" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {(showFilters || filtersSubmitted) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground text-left block">
                    <Globe className="inline-block w-4 h-4 mr-2" />
                    Country
                  </label>
                  <Select 
                    value={selectedCountry} 
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground text-left block">
                    <Filter className="inline-block w-4 h-4 mr-2" />
                    Category
                  </label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {newsCategories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="gap-2 shadow-large hover:shadow-glow transition-all w-full sm:w-auto"
              >
                <Zap className="w-5 h-5" />
                {filtersSubmitted ? 'Show Memes' : 'Generate Memes from News'}
              </Button>
              <Link to="/custom-meme" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2 w-full"
                >
                  Create Custom Meme
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-pink-500/10 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
    </section>
  );
};

export default Hero;
