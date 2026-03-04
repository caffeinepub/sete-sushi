import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Offer } from "../apiClient";
import { formatPrice } from "../apiClient";
import { useCart } from "../context/CartContext";
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

interface OfferCardProps {
  offer: Offer;
  index: number;
}

export function OfferCard({ offer, index }: OfferCardProps) {
  const { settings } = useSettings();
  const { addItem, isInCart, getQuantity } = useCart();
  const imageUrl = offer.imageUrl ?? getFallbackImage(offer.name);

  const [justAdded, setJustAdded] = useState(false);
  const inCart = isInCart(offer.id);
  const qty = getQuantity(offer.id);

  const handleAddToCart = () => {
    addItem(offer);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <motion.article
      data-ocid={`offers.item.${index}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className="group relative rounded-xl overflow-hidden card-dark hover:border-primary/40 transition-all duration-300 hover:shadow-gold flex flex-col"
    >
      {/* Featured badge */}
      {offer.isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-primary/90 text-primary-foreground text-xs px-2.5 py-0.5 flex items-center gap-1 shadow-sm">
            <span className="text-[10px]">★</span>
            Ieteicams
          </Badge>
        </div>
      )}

      {/* In-cart quantity badge — top right */}
      <AnimatePresence>
        {inCart && !justAdded && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-[0_2px_8px_oklch(0.80_0.14_78_/_0.5)] tabular-nums"
          >
            {qty}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image — NO dark overlay per spec */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={imageUrl}
          alt={offer.name}
          className="offer-image w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors truncate">
              {offer.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {Number(offer.pieces)} gabali
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-display text-xl font-bold text-gold">
              {formatPrice(offer.priceCents, settings.currencySymbol)}
            </p>
          </div>
        </div>

        {offer.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        )}

        <div className="mt-auto pt-1">
          {/* Spring-scale wrapper on press */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Button
              data-ocid={`offers.order_button.${index}`}
              onClick={handleAddToCart}
              className={`w-full font-medium gap-2 h-11 rounded-lg transition-all duration-200 ${
                justAdded
                  ? /* Gold check state — stays premium */
                    "bg-primary/20 border border-primary/50 text-gold shadow-[0_0_12px_oklch(0.80_0.14_78_/_0.25)]"
                  : inCart
                    ? /* Already in cart — ghost gold with subtle fill */
                      "bg-primary/15 hover:bg-primary/25 text-gold border border-primary/35 hover:border-primary/55"
                    : /* Default — solid gold */
                      "bg-primary/90 hover:bg-primary text-primary-foreground hover:shadow-gold"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {justAdded ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 6, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.85 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Pievienots
                  </motion.span>
                ) : inCart ? (
                  <motion.span
                    key="in-cart"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Grozā ({qty})
                  </motion.span>
                ) : (
                  <motion.span
                    key="default"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Pievienot grozam
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}
