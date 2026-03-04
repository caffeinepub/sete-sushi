import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, MapPin, Package, Phone, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "../../apiClient";
import type { Order } from "../../apiClient";
import { AdminLayout } from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";
import { useAuth } from "../../hooks/useAuth";
import { useSettings } from "../../hooks/useSettings";

type StatusFilter =
  | "ALL"
  | "New"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled";

const STATUS_LABELS: Record<string, string> = {
  New: "Jauns",
  Preparing: "Gatavo",
  Ready: "Gatavs",
  Completed: "Pabeigts",
  Cancelled: "Atcelts",
};

const STATUS_CLASSES: Record<string, string> = {
  New: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Preparing: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Ready: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Completed: "bg-green-500/15 text-green-400 border-green-500/30",
  Cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_OPTIONS = ["New", "Preparing", "Ready", "Completed", "Cancelled"];

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? "bg-muted/20 text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(createdAt: bigint): string {
  const ms = Number(createdAt);
  if (!ms) return "—";
  return new Date(ms).toLocaleString("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersPage() {
  const { token } = useAuth();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ["admin-orders", token, statusFilter],
    queryFn: async () => {
      if (!token || !actor) return null;
      return actor.adminListOrders(
        token,
        statusFilter === "ALL" ? null : statusFilter,
      );
    },
    enabled: !!token && !!actor && !isFetching,
    refetchInterval: 30000,
  });

  const orders = (ordersRes?.data ?? [])
    .slice()
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: string; status: string }) => {
      if (!token || !actor) throw new Error("No token");
      return actor.adminUpdateOrderStatus(token, orderId, status);
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Statuss atjaunots");
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      } else {
        toast.error(res.error ?? "Kļūda");
      }
    },
    onError: () => toast.error("Savienojuma kļūda"),
  });

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Pasūtījumi
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {orders.length} pasūtījumi
              {statusFilter !== "ALL"
                ? ` (${STATUS_LABELS[statusFilter]})`
                : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger
                data-ocid="admin.orders_status_select"
                className="w-40 bg-input border-border text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="ALL">Visi</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
              }
              className="border-border/60 text-muted-foreground hover:text-foreground h-9 w-9"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-32 w-full bg-muted/20 rounded-lg"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div
            data-ocid="admin.orders.empty_state"
            className="card-dark rounded-lg p-12 text-center"
          >
            <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {statusFilter === "ALL"
                ? "Nav pasūtījumu"
                : `Nav pasūtījumu ar statusu "${STATUS_LABELS[statusFilter]}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, idx) => (
              <OrderCard
                key={order.id}
                order={order}
                index={idx + 1}
                currencySymbol={settings.currencySymbol}
                onStatusChange={(status) =>
                  updateStatusMutation.mutate({ orderId: order.id, status })
                }
                isUpdating={updateStatusMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

interface OrderCardProps {
  order: Order;
  index: number;
  currencySymbol: string;
  onStatusChange: (status: string) => void;
  isUpdating: boolean;
}

function OrderCard({
  order,
  index,
  currencySymbol,
  onStatusChange,
  isUpdating,
}: OrderCardProps) {
  const isDelivery = order.deliveryTypeText === "DELIVERY";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="card-dark rounded-lg p-4"
    >
      <div className="flex flex-wrap items-start gap-4 justify-between">
        {/* Left info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={order.statusText} />
            <span className="text-xs text-muted-foreground font-mono">
              #{order.id.slice(-8).toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(order.createdAt)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Offer info */}
            <div className="text-sm">
              <span className="font-medium text-foreground">
                {order.offerName}
              </span>
              <span className="text-muted-foreground">
                {" · "}
                {Number(order.offerPieces)} porcijas{" · "}
                {formatPrice(order.offerPriceCents, currencySymbol)}
              </span>
            </div>

            {/* Customer */}
            <div className="flex flex-col gap-1">
              {order.customerName && (
                <span className="text-sm text-foreground">
                  {order.customerName}
                </span>
              )}
              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-1.5 text-sm text-gold hover:text-primary/80 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {order.customerPhone}
              </a>
            </div>
          </div>

          {/* Delivery/Pickup info */}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span
              className={`flex items-center gap-1 ${isDelivery ? "text-blue-400/80" : "text-green-400/80"}`}
            >
              <MapPin className="w-3 h-3" />
              {isDelivery
                ? `Piegāde: ${order.address}`
                : `Izņemšana: ${order.pickupAddress}`}
            </span>
            {order.desiredTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {order.desiredTime}
              </span>
            )}
          </div>

          {order.notes && (
            <p className="mt-1.5 text-xs text-muted-foreground/70 italic">
              "{order.notes}"
            </p>
          )}
        </div>

        {/* Status select */}
        <div className="flex-shrink-0">
          <Select
            value={order.statusText}
            onValueChange={onStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger
              data-ocid={`admin.order_status_select.${index}`}
              className="w-36 bg-input border-border text-xs h-8"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}
