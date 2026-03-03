import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Eye, EyeOff, ImageIcon, Loader2, Star, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Offer } from "../../apiClient";
import { AdminLayout } from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";
import { useAuth } from "../../hooks/useAuth";

interface OfferForm {
  name: string;
  pieces: string;
  priceEuros: string;
  description: string;
}

interface FormErrors {
  name?: string;
  pieces?: string;
  priceEuros?: string;
}

export function OfferEditPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { token } = useAuth();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<OfferForm>({
    name: "",
    pieces: "",
    priceEuros: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load offer
  const { data: offersRes, isLoading } = useQuery({
    queryKey: ["admin-offers", token],
    queryFn: async () => {
      if (!token || !actor) return null;
      return actor.adminListOffers(token);
    },
    enabled: !!token && !!actor && !isFetching,
  });

  const offer = offersRes?.data?.find((o: Offer) => o.id === id);

  useEffect(() => {
    if (offer) {
      setForm({
        name: offer.name,
        pieces: String(Number(offer.pieces)),
        priceEuros: (Number(offer.priceCents) / 100).toFixed(2),
        description: offer.description,
      });
      if (offer.imageUrl) setImagePreview(offer.imageUrl);
    }
  }, [offer]);

  const updateField = (key: keyof OfferForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Nosaukums ir obligāts";
    const pieces = Number.parseInt(form.pieces);
    if (!form.pieces || Number.isNaN(pieces) || pieces <= 0)
      newErrors.pieces = "Porcijām jābūt > 0";
    const price = Number.parseFloat(form.priceEuros.replace(",", "."));
    if (!form.priceEuros || Number.isNaN(price) || price <= 0)
      newErrors.priceEuros = "Cenai jābūt > 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!token || !id || !actor) throw new Error("No token");
      const pieces = Number.parseInt(form.pieces);
      const priceCents = Math.round(
        Number.parseFloat(form.priceEuros.replace(",", ".")) * 100,
      );
      return actor.adminUpdateOffer(
        token,
        id,
        form.name.trim(),
        BigInt(pieces),
        BigInt(priceCents),
        form.description.trim(),
      );
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Piedāvājums saglabāts");
        queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      } else {
        toast.error(res.error ?? "Kļūda");
      }
    },
    onError: () => toast.error("Savienojuma kļūda"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      if (!token || !id || !actor) throw new Error("No token");
      return actor.adminToggleActive(token, id, isActive);
    },
    onSuccess: (res, isActive) => {
      if (res.ok) {
        toast.success(isActive ? "Aktivizēts" : "Deaktivizēts");
        queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      } else {
        toast.error(res.error ?? "Kļūda");
      }
    },
    onError: () => toast.error("Savienojuma kļūda"),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (isFeatured: boolean) => {
      if (!token || !id || !actor) throw new Error("No token");
      return actor.adminSetFeatured(token, id, isFeatured);
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Atjaunots");
        queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      } else {
        toast.error(res.error ?? "Kļūda");
      }
    },
    onError: () => toast.error("Savienojuma kļūda"),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !id || !actor) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const res = await actor.adminUploadOfferImage(
        token,
        id,
        bytes,
        file.type,
        file.name,
      );

      if (res.ok && res.imageId && res.imageUrl) {
        // Save to offer record
        await actor.adminUpdateOfferImage(token, id, res.imageId, res.imageUrl);
        setImagePreview(res.imageUrl);
        toast.success("Attēls augšupielādēts");
        queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      } else {
        toast.error(res.error ?? "Augšupielādes kļūda");
      }
    } catch {
      toast.error("Kļūda augšupielādējot attēlu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-8 w-48 bg-muted/20" />
          <Skeleton className="h-64 w-full bg-muted/20 rounded-lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!offer && !isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-lg text-center py-12">
          <p className="text-muted-foreground">Piedāvājums nav atrasts</p>
          <Button
            onClick={() => navigate({ to: "/admin/offers" })}
            variant="outline"
            className="mt-4 border-border/60"
          >
            Atpakaļ
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Rediģēt piedāvājumu
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {offer?.name}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/admin/offers" })}
            className="border-border/60 text-sm"
          >
            ← Atpakaļ
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main form */}
          <div className="lg:col-span-3 card-dark rounded-lg p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">
                  Nosaukums <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  data-ocid="admin.offer_form_name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={`bg-input border-border ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-pieces">
                  Porciju skaits <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-pieces"
                  data-ocid="admin.offer_form_pieces"
                  type="number"
                  min="1"
                  value={form.pieces}
                  onChange={(e) => updateField("pieces", e.target.value)}
                  className={`bg-input border-border ${errors.pieces ? "border-destructive" : ""}`}
                />
                {errors.pieces && (
                  <p className="text-xs text-destructive">{errors.pieces}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-price">
                  Cena (€) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-price"
                  data-ocid="admin.offer_form_price"
                  type="text"
                  inputMode="decimal"
                  value={form.priceEuros}
                  onChange={(e) => updateField("priceEuros", e.target.value)}
                  className={`bg-input border-border ${errors.priceEuros ? "border-destructive" : ""}`}
                />
                {errors.priceEuros && (
                  <p className="text-xs text-destructive">
                    {errors.priceEuros}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-desc">Apraksts</Label>
                <Textarea
                  id="edit-desc"
                  data-ocid="admin.offer_form_description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="bg-input border-border resize-none"
                  rows={3}
                />
              </div>

              {updateMutation.isError && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">
                    Kļūda saglabājot
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                data-ocid="admin.offer_submit_button"
                disabled={updateMutation.isPending}
                className="w-full bg-primary/90 hover:bg-primary text-primary-foreground gap-2"
              >
                {updateMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Saglabāt izmaiņas
              </Button>
            </form>
          </div>

          {/* Side panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image upload */}
            <div className="card-dark rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Attēls</h3>

              {/* Preview */}
              <div
                data-ocid="admin.image_dropzone"
                className="relative aspect-video rounded-md overflow-hidden bg-muted/20 border border-border/40 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) =>
                  e.key === "Enter" && fileInputRef.current?.click()
                }
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs">Nav attēla</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gold" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="admin.image_upload_button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-border/60 hover:border-primary/40 gap-2 text-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? "Augšupielādē..." : "Augšupielādēt attēlu"}
              </Button>
            </div>

            {/* Toggles */}
            <div className="card-dark rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Iestatījumi
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {offer?.isActive ? (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Label className="text-sm cursor-pointer">Aktīvs</Label>
                </div>
                <Switch
                  checked={offer?.isActive ?? false}
                  onCheckedChange={(v) => toggleActiveMutation.mutate(v)}
                  disabled={toggleActiveMutation.isPending}
                  className="data-[state=checked]:bg-primary/80"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star
                    className={`w-4 h-4 ${offer?.isFeatured ? "text-gold fill-current" : "text-muted-foreground"}`}
                  />
                  <Label className="text-sm cursor-pointer">Ieteicams</Label>
                </div>
                <Switch
                  checked={offer?.isFeatured ?? false}
                  onCheckedChange={(v) => toggleFeaturedMutation.mutate(v)}
                  disabled={toggleFeaturedMutation.isPending}
                  className="data-[state=checked]:bg-primary/80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
