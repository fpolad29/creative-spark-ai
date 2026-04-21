import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import nbrLogo from "@/assets/nbr-logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={nbrLogo} alt="NBR Marketing" className="h-8" />
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Connexion</Button>
          </Link>
          <Link to="/signup">
            <Button variant="hero">Commencer Gratuitement</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;