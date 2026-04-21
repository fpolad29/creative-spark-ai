import { Link } from "react-router-dom";
import { Linkedin, Instagram, Facebook, Mail, Phone } from "lucide-react";
import nbrLogo from "@/assets/nbr-logo.png";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-[hsl(220,20%,10%)] text-white">
      {/* CTA Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Besoin de créatives ads haute conversion ?
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Déléguez vos créas à notre agence spécialisée en publicités Meta & TikTok.
          </p>
          <a href="https://nbrmarketing.com/" target="_blank" rel="noopener noreferrer">
            <Button variant="hero" size="xl">
              Réserver un appel découverte
            </Button>
          </a>
        </div>
      </div>

      {/* Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src={nbrLogo} alt="NBR Marketing" className="h-8 mb-4 brightness-0 invert" />
            <p className="text-white/60 text-sm">
              Agence de créatives ads. Vidéos UGC & créatives statiques haute conversion pour Meta & TikTok.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="https://nbrmarketing.com/#portfolio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="https://nbrmarketing.com/#solution" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Solution</a></li>
              <li><a href="https://nbrmarketing.com/#offres" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Offres</a></li>
              <li><a href="https://nbrmarketing.com/#temoignages" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Témoignages</a></li>
              <li><a href="https://nbrmarketing.com/blog" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="https://nbrmarketing.com/mentions-legales" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Mentions légales</a></li>
              <li><a href="https://nbrmarketing.com/cgv" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">CGV</a></li>
              <li><a href="https://nbrmarketing.com/politique-de-confidentialite" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Suivez-nous</h4>
            <div className="flex gap-3 mb-4">
              <a href="https://www.linkedin.com/company/111333349/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/nbr_marketing/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61586888373702" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-2 text-sm text-white/60">
              <a href="mailto:florianpolard@nbrmarketing.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4" /> florianpolard@nbrmarketing.com
              </a>
              <a href="tel:0749187275" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4" /> 07 49 18 72 75
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/40">
          <p>© {new Date().getFullYear()} NBR Marketing. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;