import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import type { Offer } from "../apiClient";
import { formatPrice } from "../apiClient";
import { useActor } from "../hooks/useActor";
import { useSettings } from "../hooks/useSettings";

interface OrderModalProps {
  offer: Offer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DeliveryType = "DELIVERY" | "PICKUP";

interface FormState {
  phone: string;
  name: string;
  deliveryType: DeliveryType;
  address: string;
  desiredTime: string;
  notes: string;
}

interface FormErrors {
  phone?: string;
  address?: string;
  general?: string;
}

const INITIAL_FORM: FormState = {
  phone: "",
  name: "",
  deliveryType: "DELIVERY",
  address: "",
  desiredTime: "",
  notes: "",
};

export function OrderModal({ offer, open, onOpenChange }: OrderModalProps) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { actor } = useActor();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    if (!offer || !actor) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await actor.createOrder(
        offer.id,
        form.phone.trim(),
        form.name.trim(),
        form.deliveryType,
        form.deliveryType === "DELIVERY" ? form.address.trim() : "",
        form.desiredTime.trim(),
        form.notes.trim(),
      );

      if (res.ok && res.orderId) {
        setIsSuccess(true);
        const orderId = res.orderId;
        setTimeout(() => {
          onOpenChange(false);
          setForm(INITIAL_FORM);
          setIsSuccess(false);
          navigate({ to: "/order/thanks", search: { orderId } });
        }, 600);
      } else {
        setErrors({
          general:
            res.error ?? "Kļūda pasūtījuma nosūtīšanā. Mēģiniet vēlreiz.",
        });
      }
    } catch {
      setErrors({ general: "Savienojuma kļūda. Mēģiniet vēlreiz." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm(INITIAL_FORM);
      setErrors({});
      setIsSuccess(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-ocid="order.modal"
        className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Pasūtīt
          </DialogTitle>
          {offer && (
            <DialogDescription className="text-muted-foreground">
              <span className="font-medium text-gold">{offer.name}</span>
              {" — "}
              {Number(offer.pieces)} porcijas,{" "}
              {formatPrice(offer.priceCents, settings.currencySymbol)}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Phone — FIRST and required */}
          <div className="space-y-1.5">
            <Label htmlFor="order-phone" className="text-sm font-medium">
              Tālrunis <span className="text-destructive">*</span>
            </Label>
            <Input
              id="order-phone"
              data-ocid="order.phone_input"
              type="tel"
              placeholder="+371 2X XXX XXX"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              autoComplete="tel"
              className={`bg-input border-border text-base ${errors.phone ? "border-destructive" : ""}`}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="order-name" className="text-sm font-medium">
              Vārds{" "}
              <span className="text-muted-foreground/60 text-xs">
                (nav obligāts)
              </span>
            </Label>
            <Input
              id="order-name"
              data-ocid="order.name_input"
              type="text"
              placeholder="Jūsu vārds"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              autoComplete="name"
              className="bg-input border-border text-base"
            />
          </div>

          {/* Delivery type */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Piegādes veids</Label>
            <ToggleGroup
              type="single"
              data-ocid="order.delivery_select"
              value={form.deliveryType}
              onValueChange={(val) =>
                val && updateField("deliveryType", val as DeliveryType)
              }
              className="w-full"
            >
              <ToggleGroupItem
                value="DELIVERY"
                className="flex-1 data-[state=on]:bg-primary/20 data-[state=on]:text-gold data-[state=on]:border-primary/40 border border-border"
              >
                Piegāde
              </ToggleGroupItem>
              <ToggleGroupItem
                value="PICKUP"
                className="flex-1 data-[state=on]:bg-primary/20 data-[state=on]:text-gold data-[state=on]:border-primary/40 border border-border"
              >
                Izņemšana
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Address — only for DELIVERY */}
          {form.deliveryType === "DELIVERY" && (
            <div className="space-y-1.5">
              <Label htmlFor="order-address" className="text-sm font-medium">
                Piegādes adrese <span className="text-destructive">*</span>
              </Label>
              <Input
                id="order-address"
                data-ocid="order.address_input"
                type="text"
                placeholder="Iela, mājas nr., dzīvoklis, pilsēta"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                autoComplete="street-address"
                className={`bg-input border-border text-base ${errors.address ? "border-destructive" : ""}`}
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address}</p>
              )}
            </div>
          )}

          {/* Pickup address info */}
          {form.deliveryType === "PICKUP" && (
            <div className="flex items-start gap-2 bg-muted/40 rounded-md p-3 border border-border/50">
              <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground/80">
                  Izņemšanas adrese
                </p>
                <p className="text-sm text-gold">{settings.pickupAddress}</p>
              </div>
            </div>
          )}

          {/* Desired time */}
          <div className="space-y-1.5">
            <Label htmlFor="order-time" className="text-sm font-medium">
              Vēlamais laiks{" "}
              <span className="text-muted-foreground/60 text-xs">
                (nav obligāts)
              </span>
            </Label>
            <Input
              id="order-time"
              data-ocid="order.time_input"
              type="text"
              placeholder="piem. 19:30"
              value={form.desiredTime}
              onChange={(e) => updateField("desiredTime", e.target.value)}
              className="bg-input border-border text-base"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="order-notes" className="text-sm font-medium">
              Piezīmes{" "}
              <span className="text-muted-foreground/60 text-xs">
                (nav obligāts)
              </span>
            </Label>
            <Textarea
              id="order-notes"
              data-ocid="order.notes_textarea"
              placeholder="Īpaši pieprasījumi, alerģijas..."
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="bg-input border-border text-base resize-none"
              rows={2}
            />
          </div>

          {/* Delivery note from settings */}
          {form.deliveryType === "DELIVERY" && settings.deliveryNote && (
            <p className="text-xs text-muted-foreground/70 italic">
              {settings.deliveryNote}
            </p>
          )}

          {/* Error */}
          {errors.general && (
            <Alert
              data-ocid="order.error_state"
              variant="destructive"
              className="py-2"
            >
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                {errors.general}
              </AlertDescription>
            </Alert>
          )}

          {/* Success */}
          {isSuccess && (
            <div
              data-ocid="order.success_state"
              className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 rounded-md p-3"
            >
              Pasūtījums pieņemts! Pārsūtām...
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            data-ocid="order.submit_button"
            disabled={isSubmitting || isSuccess || !actor}
            className="w-full bg-primary/90 hover:bg-primary text-primary-foreground font-medium gap-2"
          >
            {isSubmitting && (
              <Loader2
                data-ocid="order.loading_state"
                className="w-4 h-4 animate-spin"
              />
            )}
            {isSubmitting ? "Sūta..." : "Apsūtīt pasūtījumu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
