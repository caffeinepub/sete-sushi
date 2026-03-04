import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { formatPrice } from "../apiClient";
import { useCart } from "../context/CartContext";

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

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, totalCents, updateQuantity, removeItem, totalItems } =
    useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate({ to: "/checkout" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-ocid="cart.drawer"
        side="right"
        /* Full height flex column, bg matches the deep card tone */
        className="w-full sm:w-[440px] flex flex-col p-0"
        style={{
          background: "oklch(0.12 0.004 60)",
          borderColor: "oklch(0.25 0.01 60)",
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <SheetHeader className="px-5 pt-6 pb-4 border-b border-border/40 flex-shrink-0">
          <SheetTitle className="font-display text-xl text-foreground flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-gold" />
            </span>
            Grozs
            {totalItems > 0 && (
              <span className="ml-auto text-xs font-body font-normal text-muted-foreground tabular-nums">
                {totalItems} prec{totalItems === 1 ? "e" : "es"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* ── Items list ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-2">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div
                data-ocid="cart.empty_state"
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-56 gap-5 text-center px-4 mt-8"
              >
                {/* Decorative sushi bowl icon treatment */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-gold/60" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">0</span>
                  </div>
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-foreground/70 mb-1">
                    Grozs ir tukšs
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Pievienojiet piedāvājumus,
                    <br />
                    lai sāktu pasūtīšanu
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-gold hover:bg-primary/10 hover:border-primary/50 gap-1.5 transition-all"
                  onClick={() => {
                    onOpenChange(false);
                    navigate({ to: "/offers" });
                  }}
                >
                  Skatīt piedāvājumus
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ) : (
              items.map((item, idx) => {
                const imageUrl =
                  item.imageUrl ?? getFallbackImage(item.offerName);
                const itemTotal = item.offerPriceCents * item.quantity;
                return (
                  <motion.div
                    key={item.offerId}
                    data-ocid={`cart.item.${idx + 1}`}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24, scaleY: 0.8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex gap-3 items-center p-3 rounded-xl border border-border/30 hover:border-border/60 transition-colors"
                    style={{ background: "oklch(0.16 0.005 60)" }}
                  >
                    {/* Image — rounded-lg, no hard crop */}
                    <div className="w-[60px] h-[60px] rounded-lg overflow-hidden flex-shrink-0 border border-border/30">
                      <img
                        src={imageUrl}
                        alt={item.offerName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info + qty */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground truncate leading-tight mb-0.5">
                        {item.offerName}
                      </p>
                      <p className="text-[11px] text-muted-foreground mb-2">
                        {item.offerPieces} gab. ·{" "}
                        <span className="text-gold/80">
                          {formatPrice(BigInt(item.offerPriceCents))}
                        </span>
                      </p>

                      {/* Qty controls — 44px tap-target zone */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          data-ocid={`cart.quantity_minus.${idx + 1}`}
                          onClick={() =>
                            updateQuantity(item.offerId, item.quantity - 1)
                          }
                          aria-label={`Samazināt ${item.offerName} daudzumu`}
                          /* 44×44px touch target via padding + visual 28×28 */
                          className="flex items-center justify-center w-[44px] h-[44px] -m-[8px] rounded-lg text-muted-foreground hover:text-gold transition-colors"
                        >
                          <span className="w-7 h-7 rounded-md border border-border/60 hover:border-primary/40 flex items-center justify-center">
                            <Minus className="w-3 h-3" />
                          </span>
                        </button>
                        <span className="text-sm font-semibold w-6 text-center text-foreground tabular-nums select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          data-ocid={`cart.quantity_plus.${idx + 1}`}
                          onClick={() =>
                            updateQuantity(item.offerId, item.quantity + 1)
                          }
                          aria-label={`Palielināt ${item.offerName} daudzumu`}
                          className="flex items-center justify-center w-[44px] h-[44px] -m-[8px] rounded-lg text-muted-foreground hover:text-gold transition-colors"
                        >
                          <span className="w-7 h-7 rounded-md border border-border/60 hover:border-primary/40 flex items-center justify-center">
                            <Plus className="w-3 h-3" />
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Price + remove — stacked right */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0 ml-1">
                      <p className="font-display text-sm font-bold text-gold tabular-nums">
                        {formatPrice(BigInt(itemTotal))}
                      </p>
                      {/* 44px touch target for remove */}
                      <button
                        type="button"
                        data-ocid={`cart.remove_button.${idx + 1}`}
                        onClick={() => removeItem(item.offerId)}
                        aria-label={`Noņemt ${item.offerName} no groza`}
                        className="flex items-center justify-center w-[44px] h-[44px] -mr-[10px] -mb-[10px] rounded-lg text-muted-foreground/50 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="flex-shrink-0 px-4 pb-6 pt-4 border-t border-border/40 space-y-3"
              style={{ background: "oklch(0.12 0.004 60)" }}
            >
              {/* Total row */}
              <div className="flex items-baseline justify-between px-1">
                <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-body">
                  Kopā
                </span>
                <span className="font-display text-3xl font-bold text-gold leading-none">
                  {formatPrice(BigInt(totalCents))}
                </span>
              </div>

              <Separator className="bg-border/30" />

              {/* Checkout CTA — gold, full-width, prominent */}
              <Button
                data-ocid="cart.checkout_button"
                onClick={handleCheckout}
                /* h-14 = 56px explicit height, solid gold background */
                className="w-full h-14 text-base font-semibold gap-2 rounded-xl transition-all
                  bg-primary hover:bg-primary/90 text-primary-foreground
                  shadow-[0_4px_24px_oklch(0.80_0.14_78_/_0.35)]
                  hover:shadow-[0_6px_32px_oklch(0.80_0.14_78_/_0.50)]
                  active:scale-[0.98]"
              >
                Doties uz kasi
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-center text-[11px] text-muted-foreground/50">
                Piegādes informāciju ievadīsiet kasē
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
