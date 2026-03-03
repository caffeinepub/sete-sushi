import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrdersListResponse {
    ok: boolean;
    data: Array<Order>;
    error?: string;
}
export interface Settings {
    currencySymbol: string;
    deliveryNote: string;
    minOrderCents: bigint;
    pickupAddress: string;
    brandName: string;
    workHoursText: string;
}
export interface OffersListResponse {
    ok: boolean;
    data: Array<Offer>;
    error?: string;
}
export interface Offer {
    id: string;
    sortOrder: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    isActive: boolean;
    pieces: bigint;
    updatedAt: bigint;
    imageUrl?: string;
    isFeatured: boolean;
    imageId?: string;
    priceCents: bigint;
}
export interface CreateOrderResponse {
    ok: boolean;
    error?: string;
    orderId?: string;
}
export interface SessionResponse {
    ok: boolean;
    token?: string;
    error?: string;
}
export interface Order {
    id: string;
    customerName: string;
    offerName: string;
    offerPriceCents: bigint;
    desiredTime: string;
    customerPhone: string;
    createdAt: bigint;
    offerPieces: bigint;
    deliveryTypeText: string;
    pickupAddress: string;
    address: string;
    notes: string;
    statusText: string;
    offerId: string;
}
export interface UploadImageResponse {
    ok: boolean;
    error?: string;
    imageUrl?: string;
    imageId?: string;
}
export interface backendInterface {
    adminCreateOffer(token: string, name: string, pieces: bigint, priceCents: bigint, description: string): Promise<{
        id?: string;
        ok: boolean;
        error?: string;
    }>;
    adminDeleteOffer(token: string, id: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    adminListOffers(token: string): Promise<OffersListResponse>;
    adminListOrders(token: string, statusFilter: string | null): Promise<OrdersListResponse>;
    adminLogin(password: string): Promise<SessionResponse>;
    adminLogout(token: string): Promise<{
        ok: boolean;
    }>;
    adminSetFeatured(token: string, id: string, isFeatured: boolean): Promise<{
        ok: boolean;
        error?: string;
    }>;
    adminSetSortOrder(token: string, id: string, sortOrder: bigint): Promise<{
        ok: boolean;
        error?: string;
    }>;
    adminToggleActive(token: string, id: string, isActive: boolean): Promise<{
        ok: boolean;
        error?: string;
    }>;
    adminUpdateOffer(token: string, id: string, name: string, pieces: bigint, priceCents: bigint, description: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    adminUpdateOfferImage(token: string, id: string, imageId: string, imageUrl: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    adminUpdateOrderStatus(token: string, orderId: string, newStatus: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    adminUpdateSettings(token: string, brandName: string, pickupAddress: string, workHoursText: string, deliveryNote: string, minOrderCents: bigint, currencySymbol: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    adminUploadOfferImage(token: string, offerId: string, imageBytes: Uint8Array, mimeType: string, filename: string): Promise<UploadImageResponse>;
    createOrder(offerId: string, customerPhone: string, customerName: string, deliveryType: string, address: string, desiredTime: string, notes: string): Promise<CreateOrderResponse>;
    getOfferById(id: string): Promise<Offer | null>;
    getSettings(): Promise<Settings>;
    listOffersPublic(): Promise<Array<Offer>>;
}
