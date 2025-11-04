import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Laugh } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
          <div className="p-2 rounded-lg gradient-primary">
            <Laugh className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-heading font-bold">AI Meme Gen</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/gallery">
            <Button variant="ghost">Gallery</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost">About</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
