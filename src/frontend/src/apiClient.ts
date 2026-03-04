/**
 * SETE API Client
 * Typed wrapper around the Motoko backend actor.
 * Import the actor from useActor() hook, then call these functions with it.
 */
import type { backendInterface } from "./backend.d";
import type {
  CreateOrderResponse,
  Offer,
  OffersListResponse,
  Order,
  OrdersListResponse,
  SessionResponse,
  Settings,
  UploadImageResponse,
} from "./backend.d";

export type { Settings, Offer, Order };
export type {
  CreateOrderResponse,
  SessionResponse,
  OffersListResponse,
  OrdersListResponse,
  UploadImageResponse,
  backendInterface,
};

// ── Public API ────────────────────────────────────────────────────────────────

export async function getSettings(actor: backendInterface): Promise<Settings> {
  return actor.getSettings();
}

export async function listOffersPublic(
  actor: backendInterface,
): Promise<Offer[]> {
  const res = await actor.listOffersPublic();
  return res.data;
}

export async function getOfferById(
  actor: backendInterface,
  id: string,
): Promise<Offer | null> {
  const res = await actor.getOfferById(id);
  return res.offer ?? null;
}

export async function createOrder(
  actor: backendInterface,
  offerId: string,
  customerPhone: string,
  customerName: string,
  deliveryType: "DELIVERY" | "PICKUP",
  address: string,
  desiredTime: string,
  notes: string,
): Promise<CreateOrderResponse> {
  return actor.createOrder(
    offerId,
    customerPhone,
    customerName,
    deliveryType,
    address,
    desiredTime,
    notes,
  );
}

// ── Admin Auth API ────────────────────────────────────────────────────────────

export async function adminLogin(
  actor: backendInterface,
  password: string,
): Promise<SessionResponse> {
  return actor.adminLogin(password);
}

export async function adminLogout(
  actor: backendInterface,
  token: string,
): Promise<{ ok: boolean }> {
  return actor.adminLogout(token);
}

// ── Admin Offers API ──────────────────────────────────────────────────────────

export async function adminListOffers(
  actor: backendInterface,
  token: string,
): Promise<OffersListResponse> {
  return actor.adminListOffers(token);
}

export async function adminCreateOffer(
  actor: backendInterface,
  token: string,
  name: string,
  pieces: number,
  priceCents: number,
  description: string,
): Promise<{ id?: string; ok: boolean; error?: string }> {
  return actor.adminCreateOffer(
    token,
    name,
    BigInt(pieces),
    BigInt(priceCents),
    description,
  );
}

export async function adminUpdateOffer(
  actor: backendInterface,
  token: string,
  id: string,
  name: string,
  pieces: number,
  priceCents: number,
  description: string,
): Promise<{ ok: boolean; error?: string }> {
  return actor.adminUpdateOffer(
    token,
    id,
    name,
    BigInt(pieces),
    BigInt(priceCents),
    description,
  );
}

export async function adminDeleteOffer(
  actor: backendInterface,
  token: string,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  return actor.adminDeleteOffer(token, id);
}

export async function adminToggleActive(
  actor: backendInterface,
  token: string,
  id: string,
  isActive: boolean,
): Promise<{ ok: boolean; error?: string }> {
  return actor.adminToggleActive(token, id, isActive);
}

export async function adminSetFeatured(
  actor: backendInterface,
  token: string,
  id: string,
  isFeatured: boolean,
): Promise<{ ok: boolean; error?: string }> {
  return actor.adminSetFeatured(token, id, isFeatured);
}

export async function adminSetSortOrder(
  actor: backendInterface,
  token: string,
  id: string,
  sortOrder: number,
): Promise<{ ok: boolean; error?: string }> {
  return actor.adminSetSortOrder(token, id, BigInt(sortOrder));
}

export async function adminUpdateOfferImage(
  actor: backendInterface,
  token: string,
  id: string,
  imageId: string,
  imageUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  return actor.adminUpdateOfferImage(token, id, imageId, imageUrl);
}

export async function adminUploadOfferImage(
  actor: backendInterface,
  token: string,
  offerId: string,
  imageBytes: Uint8Array,
  mimeType: string,
  filename: string,
): Promise<UploadImageResponse> {
  return actor.adminUploadOfferImage(
    token,
    offerId,
    imageBytes,
    mimeType,
    filename,
  );
}

// ── Admin Orders API ──────────────────────────────────────────────────────────

export async function adminListOrders(
  actor: backendInterface,
  token: string,
  statusFilter: string | null,
): Promise<OrdersListResponse> {
  return actor.adminListOrders(token, statusFilter);
}

export async function adminUpdateOrderStatus(
  actor: backendInterface,
  token: string,
  orderId: string,
  newStatus: string,
): Promise<{ ok: boolean; error?: string }> {
  return actor.adminUpdateOrderStatus(token, orderId, newStatus);
}

// ── Admin Settings API ────────────────────────────────────────────────────────

export async function adminUpdateSettings(
  actor: backendInterface,
  token: string,
  brandName: string,
  pickupAddress: string,
  workHoursText: string,
  deliveryNote: string,
  minOrderCents: number,
  currencySymbol: string,
  phone: string,
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  return actor.adminUpdateSettings(
    token,
    brandName,
    pickupAddress,
    workHoursText,
    deliveryNote,
    BigInt(minOrderCents),
    currencySymbol,
    phone,
    email,
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format priceCents bigint to display string, e.g., "12,50 €" */
export function formatPrice(priceCents: bigint, currencySymbol = "€"): string {
  const euros = Number(priceCents) / 100;
  return `${euros.toFixed(2).replace(".", ",")} ${currencySymbol}`;
}
