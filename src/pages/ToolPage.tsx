import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreativeGenerator from "@/components/CreativeGenerator";
import { supabase } from "@/integrations/supabase/client";

const ToolPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
              Générateur de <span className="gradient-text">Créatifs</span>
            </h1>
            <p className="text-muted-foreground">Uploadez une pub, décrivez votre produit, et laissez l'IA faire le reste.</p>
          </div>
          <CreativeGenerator />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ToolPage;
