import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Upload, Sparkles, ArrowRight, Zap, Target, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Trouvez une pub gagnante",
    description: "Parcourez la bibliothèque Meta Ads ou repérez une publicité performante dans votre niche.",
  },
  {
    icon: Upload,
    title: "Uploadez la capture",
    description: "Glissez-déposez la capture d'écran de la publicité dans notre outil d'analyse IA.",
  },
  {
    icon: Sparkles,
    title: "Générez votre créatif",
    description: "L'IA analyse la structure et génère un créatif original adapté à votre produit.",
  },
];

const features = [
  {
    icon: Zap,
    title: "Analyse IA avancée",
    description: "Notre IA décortique la structure visuelle, le hook, l'angle marketing et le CTA de chaque publicité.",
  },
  {
    icon: Target,
    title: "Ciblage précis",
    description: "Adaptez chaque créatif à votre audience cible avec des copies optimisées pour la conversion.",
  },
  {
    icon: TrendingUp,
    title: "Haute conversion",
    description: "Générez des publicités qui suivent les structures éprouvées des meilleures pubs du marché.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block gradient-bg text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              Propulsé par l'IA • par NBRMarketing
            </span>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Transformez les Pubs Gagnantes en{" "}
              <span className="gradient-text">Créatifs Haute Conversion</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Analysez les meilleures publicités du marché et générez des créatifs originaux 
              adaptés à votre produit en un clic.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="gap-2">
                  Commencer Gratuitement
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="heroOutline" size="xl">
                  Se connecter
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-lg mx-auto">
            Trois étapes simples pour transformer l'inspiration en créatifs performants.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative card-gradient rounded-2xl p-8 border border-border text-center group hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-bg mb-6">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute top-4 right-4 font-heading text-4xl font-bold text-primary/10">
                  {i + 1}
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-16">
            Pourquoi <span className="gradient-text">CréaGénération</span> ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow"
              >
                <f.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;