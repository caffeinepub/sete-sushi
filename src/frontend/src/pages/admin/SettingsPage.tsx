import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Settings } from "../../apiClient";
import { AdminLayout } from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";
import { useAuth } from "../../hooks/useAuth";

interface SettingsForm {
  brandName: string;
  pickupAddress: string;
  workHoursText: string;
  deliveryNote: string;
  minOrderEuros: string;
  currencySymbol: string;
  phone: string;
  email: string;
}

const DEFAULT_FORM: SettingsForm = {
  brandName: "SETE",
  pickupAddress: "Blaumaņa 34-2, Rīga",
  workHoursText: "P–Sv 12:00–22:00",
  deliveryNote: "Piegāde Rīgā. Precizēsim laiku pēc pasūtījuma.",
  minOrderEuros: "0.00",
  currencySymbol: "€",
  phone: "+371 XXXXXXXX",
  email: "sete.latvia@gmail.com",
};

export function SettingsPage() {
  const { token } = useAuth();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SettingsForm>(DEFAULT_FORM);

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["settings-admin"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        brandName: settings.brandName,
        pickupAddress: settings.pickupAddress,
        workHoursText: settings.workHoursText,
        deliveryNote: settings.deliveryNote,
        minOrderEuros: (Number(settings.minOrderCents) / 100).toFixed(2),
        currencySymbol: settings.currencySymbol,
        phone: settings.phone ?? "+371 XXXXXXXX",
        email: settings.email ?? "sete.latvia@gmail.com",
      });
    }
  }, [settings]);

  const updateField = (key: keyof SettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!token || !actor) throw new Error("No token");
      const minOrderCents = Math.round(
        Number.parseFloat(form.minOrderEuros.replace(",", ".") || "0") * 100,
      );
      return actor.adminUpdateSettings(
        token,
        form.brandName.trim(),
        form.pickupAddress.trim(),
        form.workHoursText.trim(),
        form.deliveryNote.trim(),
        BigInt(Number.isNaN(minOrderCents) ? 0 : minOrderCents),
        form.currencySymbol.trim() || "€",
        form.phone.trim(),
        form.email.trim(),
      );
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Iestatījumi saglabāti");
        queryClient.invalidateQueries({ queryKey: ["settings"] });
        queryClient.invalidateQueries({ queryKey: ["settings-admin"] });
      } else {
        toast.error(res.error ?? "Kļūda");
      }
    },
    onError: () => toast.error("Savienojuma kļūda"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-lg space-y-4">
          <Skeleton className="h-8 w-48 bg-muted/20" />
          <Skeleton className="h-64 w-full bg-muted/20 rounded-lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-lg">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Iestatījumi
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pārvaldiet vietnes iestatījumus
          </p>
        </div>

        <div className="card-dark rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Brand name */}
            <div className="space-y-1.5">
              <Label htmlFor="s-brand">Zīmola nosaukums</Label>
              <Input
                id="s-brand"
                value={form.brandName}
                onChange={(e) => updateField("brandName", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            {/* Pickup address */}
            <div className="space-y-1.5">
              <Label htmlFor="s-pickup">Izņemšanas adrese</Label>
              <Input
                id="s-pickup"
                value={form.pickupAddress}
                onChange={(e) => updateField("pickupAddress", e.target.value)}
                placeholder="Blaumaņa 34-2, Rīga"
                className="bg-input border-border"
              />
            </div>

            {/* Work hours */}
            <div className="space-y-1.5">
              <Label htmlFor="s-hours">Darba laiks</Label>
              <Input
                id="s-hours"
                value={form.workHoursText}
                onChange={(e) => updateField("workHoursText", e.target.value)}
                placeholder="P–Sv 12:00–22:00"
                className="bg-input border-border"
              />
            </div>

            {/* Delivery note */}
            <div className="space-y-1.5">
              <Label htmlFor="s-delivery">Piegādes piezīme</Label>
              <Textarea
                id="s-delivery"
                value={form.deliveryNote}
                onChange={(e) => updateField("deliveryNote", e.target.value)}
                placeholder="Informācija par piegādi..."
                className="bg-input border-border resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Min order */}
              <div className="space-y-1.5">
                <Label htmlFor="s-min">Min. pasūtījums (€)</Label>
                <Input
                  id="s-min"
                  type="text"
                  inputMode="decimal"
                  value={form.minOrderEuros}
                  onChange={(e) => updateField("minOrderEuros", e.target.value)}
                  placeholder="0.00"
                  className="bg-input border-border"
                />
              </div>

              {/* Currency symbol */}
              <div className="space-y-1.5">
                <Label htmlFor="s-currency">Valūtas simbols</Label>
                <Input
                  id="s-currency"
                  value={form.currencySymbol}
                  onChange={(e) =>
                    updateField("currencySymbol", e.target.value)
                  }
                  placeholder="€"
                  maxLength={4}
                  className="bg-input border-border"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="s-phone">Tālrunis</Label>
              <Input
                id="s-phone"
                data-ocid="admin.settings_phone_input"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+371 2X XXX XXX"
                className="bg-input border-border"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="s-email">E-pasts</Label>
              <Input
                id="s-email"
                data-ocid="admin.settings_email_input"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="sete.latvia@gmail.com"
                className="bg-input border-border"
              />
            </div>

            {saveMutation.isError && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  Kļūda saglabājot
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              data-ocid="admin.settings_submit_button"
              disabled={saveMutation.isPending}
              className="w-full bg-primary/90 hover:bg-primary text-primary-foreground gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Saglabāt iestatījumus
            </Button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
