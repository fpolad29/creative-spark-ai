import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Upload, ArrowRight, Target, ExternalLink, Image, Copy, Wand2, Clock, CheckCircle2, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import CreativeGenerator from "@/components/CreativeGenerator";

const steps = [
  { icon: Search, title: "Espionnez les meilleures pubs", description: "Parcourez la bibliothèque Meta Ads directement depuis l'outil et repérez les publicités qui cartonnent dans votre niche." },
  { icon: Upload, title: "Uploadez la capture d'écran", description: "Faites une capture de la pub qui vous inspire et glissez-la dans notre outil. L'IA va décortiquer sa structure." },
  { icon: Wand2, title: "Recevez votre créatif original", description: "L'IA génère un visuel + un copywriting 100% original, adapté à VOTRE produit, en gardant la structure qui convertit." },
];

const features = [
  { icon: Image, title: "Visuel + Copy générés", description: "Recevez un créatif publicitaire complet : image haute qualité, headline percutant, texte d'accroche et CTA optimisé." },
  { icon: Copy, title: "Inspiré, pas copié", description: "L'IA s'inspire uniquement de la structure et de l'angle marketing. Le résultat est 100% original et adapté à votre marque." },
  { icon: Clock, title: "En quelques secondes", description: "Plus besoin d'attendre des jours. Générez des variantes de pubs haute conversion instantanément." },
  { icon: Target, title: "Adapté à votre audience", description: "Renseignez votre produit, votre cible et votre bénéfice principal. L'IA personnalise chaque créatif." },
  { icon: Zap, title: "Accès à Meta Ads Library", description: "Recherchez directement les pubs de vos concurrents par niche et par pays, sans quitter l'outil." },
  { icon: CheckCircle2, title: "Prêt à lancer", description: "Téléchargez votre créatif et lancez-le sur Meta, TikTok ou n'importe quelle plateforme. Format carré 1:1." },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-foreground/5 border border-border text-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              ● OUTIL IA GRATUIT • par NBR Marketing
            </span>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Créez des <span className="text-primary italic">créas déjà testées</span> et approuvées sur votre marché
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Importez une pub qui performe, ajoutez votre logo, votre produit et votre site, puis obtenez une variation fidèle à la structure d'origine, adaptée à votre marque et prête à convertir.
            </p>
            <p className="text-sm text-muted-foreground">👇 Essayez le générateur directement ci-dessous</p>
          </motion.div>
        </div>
      </section>

      {/* Generator directly on landing page */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <CreativeGenerator gateBehindAuth />
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">3 étapes, 1 créatif prêt à lancer</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-lg mx-auto">Pas besoin d'être designer ou copywriter. L'IA fait tout le travail.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.5 }} viewport={{ once: true }} className="relative card-gradient rounded-2xl p-8 border border-border text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-bg mb-6">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute top-4 right-4 font-heading text-4xl font-bold text-primary/10">{i + 1}</div>
                <h3 className="font-heading text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">Tout ce qu'il faut pour dupliquer ce qui convertit déjà</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">Gardez la structure gagnante, injectez votre branding, votre produit et votre message, puis sortez une créa plus propre, plus cohérente et plus prête à performer.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }} viewport={{ once: true }} className="bg-background rounded-2xl p-6 border border-border hover:shadow-lg hover:border-primary/20 transition-all">
                <f.icon className="h-7 w-7 text-primary mb-3" />
                <h3 className="font-heading text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Agence */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Besoin de résultats <span className="text-primary italic">pro</span> ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              CréaGénération est un aperçu de ce que notre agence peut faire. Pour des créatives sur-mesure, du UGC et une stratégie complète Meta & TikTok, faites appel à NBR Marketing.
            </p>
            <a href="https://nbrmarketing.com/" target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="xl" className="gap-2">
                Réserver un appel découverte
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
