# SETE Sushi — Phase 1: Complete Ordering Platform

## Current State

Working platform with:
- Public homepage + offers page (single-item order modal per offer)
- Order modal: phone, name, delivery/pickup, address, time, notes, order summary
- Admin: offers CRUD + image upload, orders list + status update, settings
- Backend: Offer, Order (single-item), Settings, AdminSession in Motoko stable storage
- Order statuses: New, Preparing, Ready, Completed, Cancelled
- Settings: brandName, pickupAddress, workHoursText, deliveryNote, minOrderCents, currencySymbol, phone, email
- Phone/email dynamic from backend settings in Layout + ThanksPage + HomePage

## Requested Changes (Diff)

### Add

**Cart system (frontend state)**
- CartContext: global React context with cart state
- Cart items: { offerId, offerName, offerPieces, offerPriceCents, imageUrl, quantity }
- Cart actions: addItem, removeItem, updateQuantity, clearCart
- Cart persists in localStorage across page navigations
- Cart badge on header (item count, animated)
- Cart drawer: slide-in from right, lists items with +/- quantity controls, total, checkout button

**Checkout page** (/checkout)
- Dedicated page (replaces order modal for multi-item checkout)
- Shows cart items with quantities and subtotals
- Shows order total
- Form: customer name (required), phone (required), delivery type, address (conditional), desired time, comment
- ORDER CONFIRM button
- On success → /order/thanks?orderId=...
- Empty cart → redirect to /offers

**Backend: multi-item orders**
- OrderItem type: offerId, offerName, offerPieces, offerPriceCents, quantity
- Order type updated: items: [OrderItem], totalCents: Nat (replaces single offerId/offerName/offerPieces/offerPriceCents)
- createOrder updated: accepts items array + customer fields
- Admin orders view updated: shows all items per order + total

**Routes**
- Add /checkout route
- Keep /offers as catalog
- Keep /order/thanks as confirmation

### Modify

- OfferCard: change "Pasūtīt" button to "Pievienot grozam" (Add to cart), with + indicator on re-add
- OffersPage: remove OrderModal usage (cart drawer handles checkout flow)
- Layout Header: add cart icon button with item count badge
- ThanksPage: show order total from URL param or settings

### Remove

- OrderModal component (replaced by cart drawer + checkout page)
- Single-item order flow

## Implementation Plan

1. Update main.mo: OrderItem type, Order with items array + totalCents, createOrder with items param
2. Update backend.d.ts (regenerate from Motoko)
3. Create CartContext.tsx: state, actions, localStorage persistence
4. Create CartDrawer.tsx: slide-in cart with item list, quantity controls, total, checkout CTA
5. Update Layout.tsx: add cart button with badge, wrap app in CartProvider
6. Update OfferCard.tsx: "Add to cart" button, visual feedback
7. Update OffersPage.tsx: remove OrderModal, add CartDrawer
8. Create CheckoutPage.tsx: cart summary + customer form + submit
9. Add /checkout route in App.tsx
10. Update admin OrdersPage.tsx: display items array per order
11. Typecheck + build
