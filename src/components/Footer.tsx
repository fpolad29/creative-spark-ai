import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* CTA Section */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Prêt à créer des publicités qui convertissent ?
          </h2>
          <p className="text-background/70 mb-8 max-w-lg mx-auto">
            Transformez les meilleures publicités du marché en créatifs originaux pour votre business.
          </p>
          <Link to="/signup">
            <Button variant="hero" size="xl">
              Commencer Gratuitement
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold">CréaGénération</span>
            </div>
            <p className="text-background/60 text-sm">
              Générez des publicités haute conversion inspirées par les meilleures du marché.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Produit</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/tool" className="hover:text-background transition-colors">Générateur</Link></li>
              <li><a href="https://nbrmarketing.com/" target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors">NBRMarketing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><a href="https://www.facebook.com/ads/library/" target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors">Meta Ads Library</a></li>
              <li><a href="https://nbrmarketing.com/" target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><a href="https://nbrmarketing.com/" target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors">Site web</a></li>
              <li><a href="mailto:contact@nbrmarketing.com" className="hover:text-background transition-colors">contact@nbrmarketing.com</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm text-background/40">
          <p>© {new Date().getFullYear()} CréaGénération by NBRMarketing. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;