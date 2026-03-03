import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useState } from "react";
import type { Offer } from "../apiClient";
import { Layout } from "../components/Layout";
import { OfferCard } from "../components/OfferCard";
import { OrderModal } from "../components/OrderModal";
import { useActor } from "../hooks/useActor";

function OffersSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-dark rounded-lg overflow-hidden">
          <Skeleton className="w-full aspect-[4/3] bg-muted/30" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4 bg-muted/30" />
            <Skeleton className="h-4 w-1/2 bg-muted/30" />
            <Skeleton className="h-10 w-full bg-muted/30 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OffersPage() {
  const { actor, isFetching: actorLoading } = useActor();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ["offers-public"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listOffersPublic();
      // Sort: featured first, then by sortOrder
      return [...result].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return Number(a.sortOrder) - Number(b.sortOrder);
      });
    },
    enabled: !!actor && !actorLoading,
  });

  const handleOrder = (offer: Offer) => {
    setSelectedOffer(offer);
    setModalOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70 font-body mb-3">
            Mūsu izvēle
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">
            Piedāvājumi
          </h1>
          <div className="w-16 h-0.5 bg-primary/50 mx-auto" />
        </motion.div>

        {/* Grid */}
        {isLoading || actorLoading ? (
          <OffersSkeleton />
        ) : offers.length === 0 ? (
          <div
            data-ocid="offers.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <p className="font-display text-2xl text-foreground/40 mb-2">
              Pagaidām nav aktīvu piedāvājumu
            </p>
            <p className="text-sm">Skatiet atpakaļ drīzumā</p>
          </div>
        ) : (
          <div
            data-ocid="offers.list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {offers.map((offer, idx) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                index={idx + 1}
                onOrder={handleOrder}
              />
            ))}
          </div>
        )}
      </div>

      <OrderModal
        offer={selectedOffer}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </Layout>
  );
}
