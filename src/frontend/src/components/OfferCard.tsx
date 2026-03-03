import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star } from "lucide-react";
import { motion } from "motion/react";
import type { Offer } from "../apiClient";
import { formatPrice } from "../apiClient";
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
  onOrder: (offer: Offer) => void;
}

export function OfferCard({ offer, index, onOrder }: OfferCardProps) {
  const { settings } = useSettings();
  const imageUrl = offer.imageUrl ?? getFallbackImage(offer.name);

  return (
    <motion.article
      data-ocid={`offers.item.${index}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className="group relative rounded-lg overflow-hidden card-dark hover:border-primary/40 transition-all duration-300 hover:shadow-gold flex flex-col"
    >
      {/* Featured badge */}
      {offer.isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Ieteicams
          </Badge>
        </div>
      )}

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
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors">
              {offer.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {Number(offer.pieces)} porcijas
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
          <Button
            data-ocid={`offers.order_button.${index}`}
            onClick={() => onOrder(offer)}
            className="w-full bg-primary/90 hover:bg-primary text-primary-foreground font-medium gap-2 transition-all hover:shadow-gold"
          >
            <ShoppingBag className="w-4 h-4" />
            Pasūtīt
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
