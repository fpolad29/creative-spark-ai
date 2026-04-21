import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, Sparkles, Download, RefreshCw, ExternalLink, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const countries = [
  { code: "ALL", label: "Tous les pays" },
  { code: "FR", label: "France" },
  { code: "US", label: "États-Unis" },
  { code: "GB", label: "Royaume-Uni" },
  { code: "DE", label: "Allemagne" },
  { code: "ES", label: "Espagne" },
  { code: "IT", label: "Italie" },
  { code: "CA", label: "Canada" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "MA", label: "Maroc" },
  { code: "DZ", label: "Algérie" },
  { code: "TN", label: "Tunisie" },
];

const ToolPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adImage, setAdImage] = useState<string | null>(null);
  const [adImageFile, setAdImageFile] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [mainBenefit, setMainBenefit] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [niche, setNiche] = useState("");
  const [targetCountry, setTargetCountry] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imageUrl?: string;
    headline?: string;
    adCopy?: string;
    cta?: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkAuth();
  }, [navigate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setAdImageFile(file);
      setAdImage(URL.createObjectURL(file));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdImageFile(file);
      setAdImage(URL.createObjectURL(file));
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoImage(URL.createObjectURL(file));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {
    if (!adImageFile || !productDescription || !targetAudience || !mainBenefit) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires et uploader une image.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const imageBase64 = await fileToBase64(adImageFile);
      const { data, error } = await supabase.functions.invoke("generate-creative", {
        body: {
          imageBase64,
          productDescription,
          targetAudience,
          mainBenefit,
          customInstructions,
        },
      });
      if (error) throw error;
      setResult(data);
      toast({ title: "Créatif généré !", description: "Votre publicité est prête." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Erreur lors de la génération", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const metaUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${targetCountry}&q=${encodeURIComponent(niche)}`;

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

          {/* Meta Ads Library */}
          <div className="bg-background rounded-2xl border border-border p-6 mb-8">
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Trouver une pub dans la bibliothèque Meta
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Votre niche (ex: fitness, skincare...)" value={niche} onChange={(e) => setNiche(e.target.value)} />
              <Select value={targetCountry} onValueChange={setTargetCountry}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <a href={metaUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="heroOutline" className="w-full sm:w-auto whitespace-nowrap gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir Meta Ads Library
                </Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Upload + Inputs */}
            <div className="space-y-6">
              {/* Upload zone */}
              <div className="bg-background rounded-2xl border border-border p-6">
                <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Capture d'écran de la pub
                </h2>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors"
                  onClick={() => document.getElementById("ad-upload")?.click()}
                >
                  {adImage ? (
                    <img src={adImage} alt="Pub uploadée" className="max-h-64 mx-auto rounded-lg" />
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Glissez-déposez ou cliquez pour uploader</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
                    </div>
                  )}
                  <input id="ad-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
              </div>

              {/* Product inputs */}
              <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-heading text-lg font-semibold mb-2">Informations produit</h2>
                <div>
                  <Label>Description du produit *</Label>
                  <Textarea placeholder="Décrivez votre produit en quelques phrases..." value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
                </div>
                <div>
                  <Label>Audience cible *</Label>
                  <Input placeholder="Ex: Femmes 25-45 ans intéressées par le skincare" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
                </div>
                <div>
                  <Label>Bénéfice principal *</Label>
                  <Input placeholder="Ex: Peau visiblement plus jeune en 30 jours" value={mainBenefit} onChange={(e) => setMainBenefit(e.target.value)} />
                </div>
                <div>
                  <Label>Instructions personnalisées (optionnel)</Label>
                  <Textarea placeholder="Ton, couleurs préférées, style particulier..." value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} />
                </div>
                <div>
                  <Label>Logo (optionnel)</Label>
                  <Input type="file" accept="image/*" onChange={handleLogoSelect} />
                  {logoImage && <img src={logoImage} alt="Logo" className="h-12 mt-2" />}
                </div>
              </div>

              <Button variant="hero" size="xl" className="w-full gap-2" onClick={handleGenerate} disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {loading ? "Génération en cours..." : "Générer le Créatif"}
              </Button>
            </div>

            {/* Right: Output */}
            <div className="bg-background rounded-2xl border border-border p-6">
              <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Résultat
              </h2>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">L'IA analyse et génère votre créatif...</p>
                  <p className="text-xs text-muted-foreground mt-1">Cela peut prendre jusqu'à 60 secondes</p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {result.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img src={result.imageUrl} alt="Créatif généré" className="w-full" />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">TITRE</Label>
                      <p className="font-heading font-semibold text-lg">{result.headline}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">TEXTE PUBLICITAIRE</Label>
                      <p className="text-sm whitespace-pre-wrap">{result.adCopy}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">APPEL À L'ACTION</Label>
                      <p className="font-semibold text-primary">{result.cta}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {result.imageUrl && (
                      <a href={result.imageUrl} download="creative.png" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" /> Télécharger
                        </Button>
                      </a>
                    )}
                    <Button variant="heroOutline" className="gap-2" onClick={handleGenerate} disabled={loading}>
                      <RefreshCw className="h-4 w-4" /> Régénérer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Votre créatif apparaîtra ici</p>
                  <p className="text-xs text-muted-foreground mt-1">Uploadez une pub et remplissez les champs pour commencer</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ToolPage;