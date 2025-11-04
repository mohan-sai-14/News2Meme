import { Link } from "react-router-dom";
import { Laugh } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-muted/50">
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg gradient-primary">
                <Laugh className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-heading font-bold">AI Meme Gen</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Generate hilarious memes with the power of AI. Turn your ideas into viral content.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/custom-meme" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Create Meme
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-smooth">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AI Meme Generator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
