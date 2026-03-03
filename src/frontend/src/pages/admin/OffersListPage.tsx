import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Edit, Eye, EyeOff, Loader2, Plus, Star, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "../../apiClient";
import type { Offer } from "../../apiClient";
import { AdminLayout } from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";
import { useAuth } from "../../hooks/useAuth";
import { useSettings } from "../../hooks/useSettings";

const FALLBACK_IMAGES: Record<string, string> = {
  "SETE 01": "/assets/generated/sete-01.dim_800x600.jpg",
  "SETE 02": "/assets/generated/sete-02.dim_800x600.jpg",
  "SETE PARTY": "/assets/generated/sete-party.dim_800x600.jpg",
};

export function OffersListPage() {
  const { token } = useAuth();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: offersRes, isLoading } = useQuery({
    queryKey: ["admin-offers", token],
    queryFn: async () => {
      if (!token || !actor) return null;
      return actor.adminListOffers(token);
    },
    enabled: !!token && !!actor && !isFetching,
  });

  const offers = offersRes?.data ?? [];

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!token || !actor) throw new Error("No token");
      return actor.adminToggleActive(token, id, isActive);
    },
    onSuccess: (res, { isActive }) => {
      if (res.ok) {
        toast.success(
          isActive ? "Piedāvājums aktivizēts" : "Piedāvājums deaktivizēts",
        );
        queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      } else {
        toast.error(res.error ?? "Kļūda");
      }
    },
    onError: () => toast.error("Savienojuma kļūda"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token || !actor) throw new Error("No token");
      return actor.adminDeleteOffer(token, id);
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Piedāvājums dzēsts");
        queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      } else {
        toast.error(res.error ?? "Kļūda");
      }
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Savienojuma kļūda");
      setDeletingId(null);
    },
  });

  const sortedOffers = [...offers].sort(
    (a, b) => Number(a.sortOrder) - Number(b.sortOrder),
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Piedāvājumi
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {offers.length} kopā
            </p>
          </div>
          <Button
            asChild
            data-ocid="admin.offer_create_button"
            className="bg-primary/90 hover:bg-primary text-primary-foreground gap-2"
          >
            <Link to="/admin/offers/new">
              <Plus className="w-4 h-4" />
              Jauns piedāvājums
            </Link>
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-20 w-full bg-muted/20 rounded-lg"
              />
            ))}
          </div>
        ) : sortedOffers.length === 0 ? (
          <div
            data-ocid="admin.offers.empty_state"
            className="card-dark rounded-lg p-12 text-center"
          >
            <p className="text-muted-foreground">Nav piedāvājumu</p>
            <Button
              asChild
              size="sm"
              className="mt-4 gap-2 bg-primary/80 hover:bg-primary text-primary-foreground"
            >
              <Link to="/admin/offers/new">
                <Plus className="w-4 h-4" />
                Pievienot pirmo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedOffers.map((offer, idx) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                index={idx + 1}
                currencySymbol={settings.currencySymbol}
                onToggle={(isActive) =>
                  toggleMutation.mutate({ id: offer.id, isActive })
                }
                onDelete={() => {
                  setDeletingId(offer.id);
                  deleteMutation.mutate(offer.id);
                }}
                isDeleting={deletingId === offer.id && deleteMutation.isPending}
                isToggling={toggleMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

interface OfferRowProps {
  offer: Offer;
  index: number;
  currencySymbol: string;
  onToggle: (isActive: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
  isToggling: boolean;
}

function OfferRow({
  offer,
  index,
  currencySymbol,
  onToggle,
  onDelete,
  isDeleting,
  isToggling,
}: OfferRowProps) {
  const fallback =
    FALLBACK_IMAGES[offer.name] ?? "/assets/generated/sete-01.dim_800x600.jpg";
  const imageUrl = offer.imageUrl ?? fallback;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card-dark rounded-lg p-4 flex items-center gap-4"
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted/20">
        <img
          src={imageUrl}
          alt={offer.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground text-sm truncate">
            {offer.name}
          </span>
          {offer.isFeatured && (
            <Star className="w-3.5 h-3.5 text-gold fill-current flex-shrink-0" />
          )}
          {!offer.isActive && (
            <Badge
              variant="outline"
              className="text-xs border-muted-foreground/30 text-muted-foreground"
            >
              Neaktīvs
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {Number(offer.pieces)} porcijas ·{" "}
          {formatPrice(offer.priceCents, currencySymbol)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Active toggle */}
        <div
          className="flex items-center gap-1.5"
          title={offer.isActive ? "Aktīvs" : "Neaktīvs"}
        >
          {offer.isActive ? (
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <Switch
            data-ocid={`admin.offer_toggle_active.${index}`}
            checked={offer.isActive}
            onCheckedChange={onToggle}
            disabled={isToggling}
            className="data-[state=checked]:bg-primary/80"
          />
        </div>

        {/* Edit */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          data-ocid={`admin.offer_edit_button.${index}`}
          className="text-muted-foreground hover:text-gold h-8 w-8"
        >
          <Link to="/admin/offers/$id" params={{ id: offer.id }}>
            <Edit className="w-4 h-4" />
          </Link>
        </Button>

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-ocid={`admin.offer_delete_button.${index}`}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive h-8 w-8"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-foreground">
                Dzēst piedāvājumu?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                "{offer.name}" tiks dzēsts neatgriezeniski.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border/60">
                Atcelt
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive/80 hover:bg-destructive text-destructive-foreground"
              >
                Dzēst
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}
