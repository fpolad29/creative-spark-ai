import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Sparkles, Download, RefreshCw, ExternalLink, Loader2, ImageIcon, Lock, Globe, Package, BadgePercent } from "lucide-react";
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

interface Props {
  gateBehindAuth?: boolean;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const CreativeGenerator = ({ gateBehindAuth = false }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [adImage, setAdImage] = useState<string | null>(null);
  const [adImageFile, setAdImageFile] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoImageFile, setLogoImageFile] = useState<File | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [mainBenefit, setMainBenefit] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
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
    const prefillRaw = sessionStorage.getItem("creaPrefill");
    if (prefillRaw) {
      try {
        const p = JSON.parse(prefillRaw);
        if (p.productDescription) setProductDescription(p.productDescription);
        if (p.targetAudience) setTargetAudience(p.targetAudience);
        if (p.mainBenefit) setMainBenefit(p.mainBenefit);
        if (p.customInstructions) setCustomInstructions(p.customInstructions);
        if (p.websiteUrl) setWebsiteUrl(p.websiteUrl);
        if (p.niche) setNiche(p.niche);
        if (p.targetCountry) setTargetCountry(p.targetCountry);
      } catch {
        // noop
      }
      sessionStorage.removeItem("creaPrefill");
    }
  }, []);

  const updateImageState = useCallback((file: File | null, setFile: (file: File | null) => void, setPreview: (preview: string | null) => void) => {
    if (!file || !file.type.startsWith("image/")) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    updateImageState(e.dataTransfer.files[0] ?? null, setAdImageFile, setAdImage);
  }, [updateImageState]);

  const saveAndRedirectToSignup = () => {
    sessionStorage.setItem(
      "creaPrefill",
      JSON.stringify({
        productDescription,
        targetAudience,
        mainBenefit,
        customInstructions,
        websiteUrl,
        niche,
        targetCountry,
      }),
    );
    toast({
      title: "Inscription requise",
      description: "Créez un compte gratuit pour lancer la génération finale.",
    });
    navigate("/signup");
  };

  const handleGenerate = async () => {
    if (!adImageFile || !productDescription || !targetAudience || !mainBenefit) {
      toast({
        title: "Champs requis",
        description: "Ajoutez la créa de référence et remplissez les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (gateBehindAuth) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        saveAndRedirectToSignup();
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      const [imageBase64, logoBase64, productImageBase64] = await Promise.all([
        fileToBase64(adImageFile),
        logoImageFile ? fileToBase64(logoImageFile) : Promise.resolve(null),
        productImageFile ? fileToBase64(productImageFile) : Promise.resolve(null),
      ]);

      const { data, error } = await supabase.functions.invoke("generate-creative", {
        body: {
          imageBase64,
          logoBase64,
          productImageBase64,
          productDescription,
          targetAudience,
          mainBenefit,
          customInstructions,
          websiteUrl,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
      toast({ title: "Créatif généré", description: "Votre variation est prête." });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la génération",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const metaUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${targetCountry}&q=${encodeURIComponent(niche)}`;

  return (
    <div className="w-full">
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
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
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
        <div className="space-y-6">
          <div className="bg-background rounded-2xl border border-border p-6">
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Créa de référence
            </h2>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors"
              onClick={() => document.getElementById("ad-upload")?.click()}
            >
              {adImage ? (
                <img src={adImage} alt="Créa de référence uploadée" className="max-h-64 mx-auto rounded-lg" />
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Glissez-déposez ou cliquez pour uploader</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
                </div>
              )}
              <input
                id="ad-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => updateImageState(e.target.files?.[0] ?? null, setAdImageFile, setAdImage)}
              />
            </div>
          </div>

          <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold mb-2">Informations marque & offre</h2>
            <div>
              <Label>Description du produit *</Label>
              <Textarea placeholder="Décrivez précisément le produit, l'offre et la promesse..." value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
            </div>
            <div>
              <Label>Audience cible *</Label>
              <Input placeholder="Ex: Fondateurs e-commerce qui veulent scaler Meta Ads" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
            </div>
            <div>
              <Label>Bénéfice principal *</Label>
              <Input placeholder="Ex: Plus de leads qualifiés sans refaire toute la DA" value={mainBenefit} onChange={(e) => setMainBenefit(e.target.value)} />
            </div>
            <div>
              <Label>Site web de la marque (optionnel)</Label>
              <div className="relative">
                <Globe className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input className="pl-9" type="url" placeholder="https://votresite.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Instructions personnalisées (optionnel)</Label>
              <Textarea placeholder="Contraintes de wording, angle marketing, éléments à garder absolument..." value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} />
            </div>
          </div>

          <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold mb-2">Assets à intégrer</h2>
            <div>
              <Label>Logo (optionnel)</Label>
              <Input type="file" accept="image/*" onChange={(e) => updateImageState(e.target.files?.[0] ?? null, setLogoImageFile, setLogoImage)} />
              {logoImage && <img src={logoImage} alt="Logo de marque" className="h-14 mt-3 rounded-md border border-border p-2 bg-secondary/30" />}
            </div>
            <div>
              <Label>Produit à intégrer (optionnel)</Label>
              <Input type="file" accept="image/*" onChange={(e) => updateImageState(e.target.files?.[0] ?? null, setProductImageFile, setProductImage)} />
              {productImage && <img src={productImage} alt="Produit à intégrer" className="h-24 mt-3 rounded-md border border-border p-2 bg-secondary/30 object-contain" />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/20 px-3 py-2">
                <Package className="h-4 w-4 text-primary" />
                Produit repris dans la créa
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/20 px-3 py-2">
                <BadgePercent className="h-4 w-4 text-primary" />
                Palette alignée au branding
              </div>
            </div>
          </div>

          <Button variant="hero" size="xl" className="w-full gap-2" onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : gateBehindAuth ? <Lock className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            {loading ? "Génération en cours..." : gateBehindAuth ? "S'inscrire & Générer la créa" : "Générer la créa"}
          </Button>
          {gateBehindAuth && <p className="text-xs text-muted-foreground text-center">Inscription gratuite • accès immédiat au générateur</p>}
        </div>

        <div className="bg-background rounded-2xl border border-border p-6">
          <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Résultat
          </h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Génération de la variation fidèle en cours...</p>
              <p className="text-xs text-muted-foreground mt-1">Cela peut prendre jusqu'à 90 secondes</p>
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
              <div className="flex flex-wrap gap-3">
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
              <p className="text-muted-foreground">Votre créa adaptée apparaîtra ici</p>
              <p className="text-xs text-muted-foreground mt-1">Ajoutez une référence, votre offre et vos assets pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeGenerator;
