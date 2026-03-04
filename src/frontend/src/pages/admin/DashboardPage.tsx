import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { AdminLayout } from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";
import { useAuth } from "../../hooks/useAuth";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  linkTo: "/admin/offers" | "/admin/orders" | "/admin/settings";
  linkLabel: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  linkTo,
  linkLabel,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-dark rounded-lg p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gold" />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-foreground">{value}</p>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-fit text-muted-foreground hover:text-gold gap-1 -ml-2"
      >
        <Link to={linkTo}>
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </Button>
    </motion.div>
  );
}

export function DashboardPage() {
  const { token } = useAuth();
  const { actor, isFetching } = useActor();

  const { data: offersRes } = useQuery({
    queryKey: ["admin-offers-count", token],
    queryFn: async () => {
      if (!token || !actor) return null;
      return actor.adminListOffers(token);
    },
    enabled: !!token && !!actor && !isFetching,
  });

  const { data: ordersRes } = useQuery({
    queryKey: ["admin-orders-count", token],
    queryFn: async () => {
      if (!token || !actor) return null;
      return actor.adminListOrders(token, null);
    },
    enabled: !!token && !!actor && !isFetching,
  });

  const offersCount = offersRes?.data?.length ?? "—";
  const newOrdersCount =
    ordersRes?.data?.filter((o) => o.statusText === "New").length ?? "—";
  const ordersCount = ordersRes?.data?.length ?? "—";

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Laipni lūgti, SETE Admin
          </h1>
          <p className="text-muted-foreground text-sm">
            Pārvaldiet piedāvājumus, pasūtījumus un iestatījumus
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Kopā piedāvājumi"
            value={offersCount}
            icon={UtensilsCrossed}
            linkTo="/admin/offers"
            linkLabel="Skatīt piedāvājumus"
          />
          <StatCard
            label="Jauni pasūtījumi"
            value={newOrdersCount}
            icon={ShoppingBag}
            linkTo="/admin/orders"
            linkLabel="Skatīt pasūtījumus"
          />
          <StatCard
            label="Kopā pasūtījumi"
            value={ordersCount}
            icon={ShoppingBag}
            linkTo="/admin/orders"
            linkLabel="Skatīt visus"
          />
        </div>

        {/* Quick links */}
        <div className="card-dark rounded-lg p-5">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">
            Ātrās darbības
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              asChild
              variant="outline"
              className="justify-start gap-2 border-border/60 hover:border-primary/40 text-sm"
            >
              <Link to="/admin/offers/new">
                <UtensilsCrossed className="w-4 h-4 text-gold" />
                Jauns piedāvājums
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="justify-start gap-2 border-border/60 hover:border-primary/40 text-sm"
            >
              <Link to="/admin/orders">
                <ShoppingBag className="w-4 h-4 text-gold" />
                Pasūtījumi
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="justify-start gap-2 border-border/60 hover:border-primary/40 text-sm"
            >
              <Link to="/admin/settings">
                <Settings className="w-4 h-4 text-gold" />
                Iestatījumi
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
