import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { path: "/admin", label: "Pārskats", icon: LayoutDashboard, exact: true },
  { path: "/admin/offers", label: "Piedāvājumi", icon: UtensilsCrossed },
  { path: "/admin/orders", label: "Pasūtījumi", icon: ShoppingBag },
  { path: "/admin/settings", label: "Iestatījumi", icon: Settings },
];

function NavLink({
  path,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  path: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === path
    : location.pathname.startsWith(path) && path !== "/admin";

  const dataOcid =
    path === "/admin/offers"
      ? "admin.offers_link"
      : path === "/admin/orders"
        ? "admin.orders_link"
        : path === "/admin/settings"
          ? "admin.settings_link"
          : undefined;

  return (
    <Link
      to={
        path as "/admin" | "/admin/offers" | "/admin/orders" | "/admin/settings"
      }
      data-ocid={dataOcid}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
        isActive
          ? "bg-primary/15 text-gold border border-primary/20"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </Link>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth();
  const { actor } = useActor();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout(actor);
    navigate({ to: "/admin/login" });
  };

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-[0.15em] text-gold uppercase">
            SETE
          </span>
          <span className="text-xs text-muted-foreground font-body bg-muted/50 px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.path} {...item} onClick={onNavClick} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          data-ocid="admin.logout_button"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Iziet
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss area
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: sidebar nav panel */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onNavClick={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-sidebar">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-display text-lg font-bold tracking-wider text-gold">
            SETE Admin
          </span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
