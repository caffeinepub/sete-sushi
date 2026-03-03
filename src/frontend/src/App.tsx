import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { createContext, useContext } from "react";

// Pages
import { HomePage } from "./pages/HomePage";
import { OffersPage } from "./pages/OffersPage";
import { ThanksPage } from "./pages/ThanksPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { OfferEditPage } from "./pages/admin/OfferEditPage";
import { OfferNewPage } from "./pages/admin/OfferNewPage";
import { OffersListPage } from "./pages/admin/OffersListPage";
import { OrdersPage } from "./pages/admin/OrdersPage";
import { SettingsPage } from "./pages/admin/SettingsPage";

// Auth
import { AuthContext, useAuthState } from "./hooks/useAuth";

// ── Auth Guard ──────────────────────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    // Redirect via navigation
    window.location.hash = "#/admin/login";
    return null;
  }

  return <>{children}</>;
}

// ── Root Route ──────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground",
            success: "border-primary/30",
            error: "border-destructive/30",
          },
        }}
      />
    </>
  ),
});

// ── Public Routes ────────────────────────────────────────────────────────────
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const offersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/offers",
  component: OffersPage,
});

const thanksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order/thanks",
  component: ThanksPage,
});

// ── Admin Routes ─────────────────────────────────────────────────────────────
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: LoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  ),
});

const adminOffersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/offers",
  component: () => (
    <AuthGuard>
      <OffersListPage />
    </AuthGuard>
  ),
});

const adminOfferNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/offers/new",
  component: () => (
    <AuthGuard>
      <OfferNewPage />
    </AuthGuard>
  ),
});

const adminOfferEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/offers/$id",
  component: () => (
    <AuthGuard>
      <OfferEditPage />
    </AuthGuard>
  ),
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/orders",
  component: () => (
    <AuthGuard>
      <OrdersPage />
    </AuthGuard>
  ),
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/settings",
  component: () => (
    <AuthGuard>
      <SettingsPage />
    </AuthGuard>
  ),
});

// ── Router ───────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  homeRoute,
  offersRoute,
  thanksRoute,
  adminLoginRoute,
  adminDashboardRoute,
  adminOffersRoute,
  adminOfferNewRoute,
  adminOfferEditRoute,
  adminOrdersRoute,
  adminSettingsRoute,
]);

const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  history: hashHistory,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}
