# SETE — Premium Sushi Ordering Platform

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full public sushi ordering website for brand "SETE"
- Admin panel with password-based session auth
- Motoko canister backend with stable storage for all data
- Blob storage integration for offer images
- React frontend with React Router for all public + admin routes

### Modify
N/A — new project

### Remove
N/A — new project

## Implementation Plan

### Backend (Motoko)
- Data models: Offer, Order, Settings (singleton), AdminSession
- Stable storage: offers map, orders map, settings record, sessions map
- Seed data on init: 3 demo offers (SETE 01/02/PARTY), default settings, admin password "CHANGE_ME"
- Public API: getSettings, listOffersPublic, getOfferById, createOrder
- Admin Auth API: adminLogin, adminLogout
- Admin Offers API: adminListOffers, adminCreateOffer, adminUpdateOffer, adminDeleteOffer, adminToggleOfferActive, adminSetFeatured, adminSetSortOrder
- Admin Orders API: adminListOrders, adminUpdateOrderStatus
- Admin Settings API: adminGetSettings, adminUpdateSettings
- Image API: adminUploadImage (via blob-storage component), publicGetImageUrl
- Session token validation on all admin endpoints (token in param, expiry check)
- Order validation: offerId required, customerPhone min 6 chars, address required if DELIVERY

### Frontend (React + TypeScript + Tailwind)
- Single apiClient.ts with typed wrappers for all canister calls
- React Router v6 with hash routing (ICP-compatible)
- Public routes: / (hero+CTA), /offers (cards), /order/thanks
- Admin routes: /admin/login, /admin, /admin/offers, /admin/offers/new, /admin/offers/:id, /admin/orders, /admin/settings
- Auth guard: redirect to /admin/login if no valid token in localStorage
- Order modal: phone first, delivery/pickup toggle, conditional address, desired time, notes
- Footer: workHoursText, pickupAddress, tap-to-call (tel:XXXX), email sete.latvia@gmail.com
- No dark overlay on product images
- Mobile-first responsive layout
- deterministic data-ocid markers on all interactive elements
