import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

export function OfferNewPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { actor } = useActor();
  const [form, setForm] = useState<OfferForm>({
    name: "",
    pieces: "",
    priceEuros: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

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

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!token || !actor) throw new Error("No token");
      const pieces = Number.parseInt(form.pieces);
      const priceCents = Math.round(
        Number.parseFloat(form.priceEuros.replace(",", ".")) * 100,
      );
      return actor.adminCreateOffer(
        token,
        form.name.trim(),
        BigInt(pieces),
        BigInt(priceCents),
        form.description.trim(),
      );
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Piedāvājums izveidots");
        navigate({ to: "/admin/offers" });
      } else {
        toast.error(res.error ?? "Kļūda");
      }
    },
    onError: () => toast.error("Savienojuma kļūda"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="max-w-lg">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Jauns piedāvājums
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Izveidojiet jaunu suši piedāvājumu
          </p>
        </div>

        <div className="card-dark rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="offer-name">
                Nosaukums <span className="text-destructive">*</span>
              </Label>
              <Input
                id="offer-name"
                data-ocid="admin.offer_form_name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="piem. SETE 01"
                className={`bg-input border-border ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Pieces */}
            <div className="space-y-1.5">
              <Label htmlFor="offer-pieces">
                Porciju skaits <span className="text-destructive">*</span>
              </Label>
              <Input
                id="offer-pieces"
                data-ocid="admin.offer_form_pieces"
                type="number"
                min="1"
                value={form.pieces}
                onChange={(e) => updateField("pieces", e.target.value)}
                placeholder="piem. 48"
                className={`bg-input border-border ${errors.pieces ? "border-destructive" : ""}`}
              />
              {errors.pieces && (
                <p className="text-xs text-destructive">{errors.pieces}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="offer-price">
                Cena (€) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="offer-price"
                data-ocid="admin.offer_form_price"
                type="text"
                inputMode="decimal"
                value={form.priceEuros}
                onChange={(e) => updateField("priceEuros", e.target.value)}
                placeholder="piem. 24.90"
                className={`bg-input border-border ${errors.priceEuros ? "border-destructive" : ""}`}
              />
              {errors.priceEuros && (
                <p className="text-xs text-destructive">{errors.priceEuros}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="offer-desc">Apraksts</Label>
              <Textarea
                id="offer-desc"
                data-ocid="admin.offer_form_description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Piedāvājuma apraksts..."
                className="bg-input border-border resize-none"
                rows={3}
              />
            </div>

            {createMutation.isError && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  Savienojuma kļūda
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/admin/offers" })}
                className="flex-1 border-border/60"
              >
                Atcelt
              </Button>
              <Button
                type="submit"
                data-ocid="admin.offer_submit_button"
                disabled={createMutation.isPending}
                className="flex-1 bg-primary/90 hover:bg-primary text-primary-foreground gap-2"
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Izveidot
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
