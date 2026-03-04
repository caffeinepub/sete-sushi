import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { formatPrice } from "../apiClient";
import { Layout } from "../components/Layout";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";
import { useSettings } from "../hooks/useSettings";

// Fallback images for seed data offers
const FALLBACK_IMAGES: Record<string, string> = {
  "SETE 01": "/assets/generated/sete-01.dim_800x600.jpg",
  "SETE 02": "/assets/generated/sete-02.dim_800x600.jpg",
  "SETE PARTY": "/assets/generated/sete-party.dim_800x600.jpg",
};

function getFallbackImage(offerName: string): string {
  return (
    FALLBACK_IMAGES[offerName] ?? "/assets/generated/sete-01.dim_800x600.jpg"
  );
}

type DeliveryType = "DELIVERY" | "PICKUP";

interface FormState {
  name: string;
  phone: string;
  deliveryType: DeliveryType;
  address: string;
  desiredTime: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  general?: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  phone: "",
  deliveryType: "DELIVERY",
  address: "",
  desiredTime: "",
  notes: "",
};

// ── Field wrapper ──────────────────────────────────────────────────────────────
function FieldGroup({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalCents, clearCart } = useCart();
  const { settings } = useSettings();
  const { actor } = useActor();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If cart is empty on page load → redirect to /offers
  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      navigate({ to: "/offers" });
    }
  }, [items.length, isSuccess, navigate]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Ievadiet vārdu (min. 2 rakstzīmes)";
    }
    if (!form.phone.trim() || form.phone.trim().length < 6) {
      newErrors.phone = "Ievadiet derīgu tālruņa numuru (min. 6 rakstzīmes)";
    }
    if (form.deliveryType === "DELIVERY") {
      if (!form.address.trim() || form.address.trim().length < 5) {
        newErrors.address = "Ievadiet piegādes adresi (min. 5 rakstzīmes)";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      setErrors({ general: "Grozs ir tukšs" });
      return;
    }

    if (!validate()) return;
    if (!actor) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Submit all cart items in parallel
      const results = await Promise.all(
        items.map((item) =>
          actor.createOrder(
            item.offerId,
            form.phone.trim(),
            form.name.trim(),
            form.deliveryType,
            form.deliveryType === "DELIVERY" ? form.address.trim() : "",
            form.desiredTime.trim(),
            form.notes.trim(),
          ),
        ),
      );

      const firstFailure = results.find((r) => !r.ok);
      if (firstFailure) {
        setErrors({
          general:
            firstFailure.error ??
            "Kļūda pasūtījuma nosūtīšanā. Mēģiniet vēlreiz.",
        });
        return;
      }

      // All succeeded
      setIsSuccess(true);
      const firstOrderId = results[0]?.orderId;
      clearCart();
      setTimeout(() => {
        navigate({
          to: "/order/thanks",
          search: { orderId: firstOrderId ?? "" },
        });
      }, 900);
    } catch {
      setErrors({ general: "Savienojuma kļūda. Mēģiniet vēlreiz." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Layout>
      {/* ── Mobile sticky total bar (visible below lg, above footer) ── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 border-t border-border/40"
        style={{
          background: "oklch(0.12 0.004 60 / 0.97)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingBag className="w-4 h-4 text-gold/60" />
            <span>
              {totalItemCount} prec{totalItemCount === 1 ? "e" : "es"}
            </span>
          </div>
          <span className="font-display text-xl font-bold text-gold tabular-nums">
            {formatPrice(BigInt(totalCents))}
          </span>
        </div>
        <Button
          form="checkout-form"
          type="submit"
          data-ocid="checkout.submit_button"
          disabled={isSubmitting || isSuccess || !actor}
          className="w-full h-12 text-base font-semibold gap-2 rounded-xl
            bg-primary hover:bg-primary/90 text-primary-foreground
            shadow-[0_4px_24px_oklch(0.80_0.14_78_/_0.35)]
            hover:shadow-[0_6px_32px_oklch(0.80_0.14_78_/_0.50)]
            active:scale-[0.99] transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2
                data-ocid="checkout.loading_state"
                className="w-4 h-4 animate-spin"
              />
              Sūta...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Pieņemts!
            </>
          ) : (
            "Apstiprināt pasūtījumu"
          )}
        </Button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-10 pb-36 lg:pb-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70 font-body mb-3">
            Noformēt pasūtījumu
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">
            Kase
          </h1>
          <div className="w-16 h-0.5 bg-primary/50 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 max-w-5xl mx-auto items-start">
          {/* ── Customer form ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="order-2 lg:order-1"
          >
            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 sm:p-8 space-y-5 border border-border/50"
              style={{ background: "oklch(0.14 0.005 60)" }}
            >
              <div className="mb-2">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Piegādes informācija
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Lauki ar <span className="text-destructive">*</span> ir
                  obligāti
                </p>
              </div>

              {/* 1. Name */}
              <FieldGroup error={errors.name}>
                <Label
                  htmlFor="checkout-name"
                  className="text-sm font-medium text-foreground/80"
                >
                  Vārds <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="checkout-name"
                  data-ocid="checkout.name_input"
                  type="text"
                  placeholder="Jūsu vārds"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  autoComplete="name"
                  className={`bg-input border-border text-base h-12 rounded-lg focus-visible:ring-primary/50 ${errors.name ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                />
              </FieldGroup>

              {/* 2. Phone */}
              <FieldGroup error={errors.phone}>
                <Label
                  htmlFor="checkout-phone"
                  className="text-sm font-medium text-foreground/80"
                >
                  Tālrunis <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="checkout-phone"
                  data-ocid="checkout.phone_input"
                  type="tel"
                  placeholder="+371 2X XXX XXX"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  autoComplete="tel"
                  className={`bg-input border-border text-base h-12 rounded-lg focus-visible:ring-primary/50 ${errors.phone ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                />
              </FieldGroup>

              {/* 3. Delivery type */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground/80">
                  Piegādes veids
                </Label>
                <ToggleGroup
                  type="single"
                  data-ocid="checkout.delivery_select"
                  value={form.deliveryType}
                  onValueChange={(val) =>
                    val && updateField("deliveryType", val as DeliveryType)
                  }
                  className="w-full rounded-lg border border-border/60 p-1 gap-1"
                  style={{ background: "oklch(0.17 0.006 60)" }}
                >
                  <ToggleGroupItem
                    value="DELIVERY"
                    className="flex-1 h-10 rounded-md text-sm
                      data-[state=on]:bg-primary/20 data-[state=on]:text-gold data-[state=on]:border-primary/40 data-[state=on]:shadow-sm
                      border border-transparent text-muted-foreground hover:text-foreground transition-all"
                  >
                    Piegāde
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="PICKUP"
                    className="flex-1 h-10 rounded-md text-sm
                      data-[state=on]:bg-primary/20 data-[state=on]:text-gold data-[state=on]:border-primary/40 data-[state=on]:shadow-sm
                      border border-transparent text-muted-foreground hover:text-foreground transition-all"
                  >
                    Izņemšana
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* 4a. Address — only for DELIVERY */}
              <AnimatePresence initial={false}>
                {form.deliveryType === "DELIVERY" && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <FieldGroup error={errors.address}>
                      <Label
                        htmlFor="checkout-address"
                        className="text-sm font-medium text-foreground/80"
                      >
                        Piegādes adrese{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="checkout-address"
                        data-ocid="checkout.address_input"
                        type="text"
                        placeholder="Iela, mājas nr., dzīvoklis, pilsēta"
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        autoComplete="street-address"
                        className={`bg-input border-border text-base h-12 rounded-lg focus-visible:ring-primary/50 ${errors.address ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                      />
                      {settings.deliveryNote && (
                        <p className="text-xs text-muted-foreground/60 italic">
                          {settings.deliveryNote}
                        </p>
                      )}
                    </FieldGroup>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 4b. Pickup info */}
              <AnimatePresence initial={false}>
                {form.deliveryType === "PICKUP" && (
                  <motion.div
                    key="pickup"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-start gap-3 rounded-lg p-3.5 border border-primary/20"
                      style={{ background: "oklch(0.80 0.14 78 / 0.06)" }}
                    >
                      <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground/60 mb-0.5 uppercase tracking-wide">
                          Izņemšanas adrese
                        </p>
                        <p className="text-sm text-gold font-semibold">
                          {settings.pickupAddress}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 5. Desired time */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="checkout-time"
                  className="text-sm font-medium text-foreground/80"
                >
                  Vēlamais laiks{" "}
                  <span className="text-muted-foreground/50 text-xs font-normal">
                    — nav obligāts
                  </span>
                </Label>
                <Input
                  id="checkout-time"
                  data-ocid="checkout.time_input"
                  type="text"
                  placeholder="piem. 19:30"
                  value={form.desiredTime}
                  onChange={(e) => updateField("desiredTime", e.target.value)}
                  className="bg-input border-border text-base h-12 rounded-lg focus-visible:ring-primary/50"
                />
              </div>

              {/* 6. Notes */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="checkout-notes"
                  className="text-sm font-medium text-foreground/80"
                >
                  Komentārs{" "}
                  <span className="text-muted-foreground/50 text-xs font-normal">
                    — nav obligāts
                  </span>
                </Label>
                <Textarea
                  id="checkout-notes"
                  data-ocid="checkout.notes_textarea"
                  placeholder="Īpaši pieprasījumi, alerģijas..."
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="bg-input border-border text-base resize-none rounded-lg focus-visible:ring-primary/50"
                  rows={3}
                />
              </div>

              {/* Error */}
              <AnimatePresence initial={false}>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <Alert
                      data-ocid="checkout.error_state"
                      variant="destructive"
                      className="py-3 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence initial={false}>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-ocid="checkout.success_state"
                    className="flex items-center gap-2 text-sm text-gold bg-primary/10 rounded-lg p-3.5 border border-primary/25"
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Pasūtījums pieņemts! Pārsūtām...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Desktop submit button (hidden on mobile — mobile uses sticky bar) */}
              <div className="hidden lg:block pt-1">
                <motion.div whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    data-ocid="checkout.submit_button"
                    disabled={isSubmitting || isSuccess || !actor}
                    className="w-full h-13 text-base font-semibold gap-2 rounded-xl
                      bg-primary hover:bg-primary/90 text-primary-foreground
                      shadow-[0_4px_24px_oklch(0.80_0.14_78_/_0.30)]
                      hover:shadow-[0_6px_32px_oklch(0.80_0.14_78_/_0.45)]
                      transition-all"
                    style={{ height: "52px" }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          data-ocid="checkout.loading_state"
                          className="w-4 h-4 animate-spin"
                        />
                        Sūta...
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Pieņemts!
                      </>
                    ) : (
                      "Apstiprināt pasūtījumu"
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>

          {/* ── Order summary (right column on desktop, top on mobile) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="order-1 lg:order-2"
          >
            <div
              data-ocid="checkout.summary"
              className="rounded-2xl p-5 sm:p-6 border border-border/50 lg:sticky lg:top-24"
              style={{ background: "oklch(0.14 0.005 60)" }}
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gold/70" />
                Pasūtījuma kopsavilkums
              </h2>

              {/* Items list */}
              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  const imageUrl =
                    item.imageUrl ?? getFallbackImage(item.offerName);
                  const subtotal = item.offerPriceCents * item.quantity;
                  return (
                    <div key={item.offerId} className="flex gap-3 items-center">
                      {/* Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/40">
                        <img
                          src={imageUrl}
                          alt={item.offerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-semibold text-foreground truncate">
                          {item.offerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.offerPieces} gab. · ×{item.quantity}
                        </p>
                      </div>
                      {/* Subtotal */}
                      <p className="font-display text-sm font-bold text-gold flex-shrink-0 tabular-nums">
                        {formatPrice(BigInt(subtotal))}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Separator className="bg-border/30 mb-4" />

              {/* Delivery type */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Piegāde
                </span>
                {form.deliveryType === "DELIVERY" ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Piegāde
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-gold border border-primary/20">
                    Izņemšana
                  </span>
                )}
              </div>

              <Separator className="bg-border/30 mb-4" />

              {/* Total — gold, large, unmissable */}
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Kopā
                </span>
                <span
                  className="font-display text-4xl font-bold text-gold leading-none tabular-nums"
                  style={{ textShadow: "0 0 20px oklch(0.80 0.14 78 / 0.3)" }}
                >
                  {formatPrice(BigInt(totalCents))}
                </span>
              </div>

              {/* Min order note if set */}
              {Number(settings.minOrderCents) > 0 &&
                totalCents < Number(settings.minOrderCents) && (
                  <p className="text-xs text-muted-foreground/60 mt-2 text-right">
                    Minimālais pasūtījums:{" "}
                    {formatPrice(
                      settings.minOrderCents,
                      settings.currencySymbol,
                    )}
                  </p>
                )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
