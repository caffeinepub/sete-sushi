import { Link, useLocation } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../hooks/useSettings";
import { CartDrawer } from "./CartDrawer";

interface HeaderProps {
  onCartOpen?: () => void;
}

function Header({ onCartOpen }: HeaderProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { settings } = useSettings();
  const { totalItems } = useCart();
  const [localCartOpen, setLocalCartOpen] = useState(false);

  const handleCartClick = () => {
    if (onCartOpen) {
      onCartOpen();
    } else {
      setLocalCartOpen(true);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-display text-2xl font-bold tracking-[0.15em] text-gold uppercase group-hover:opacity-80 transition-opacity">
                SETE
              </span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/offers"
                data-ocid="nav.offers_link"
                className={`text-sm font-body font-medium tracking-wide transition-colors px-3 py-2.5 rounded-md min-h-[44px] flex items-center ${
                  !isHome
                    ? "text-gold"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                Piedāvājumi
              </Link>

              {/* Cart button — min 44×44px touch target */}
              <button
                type="button"
                data-ocid="nav.cart_button"
                onClick={handleCartClick}
                /* overflow-visible so badge isn't clipped */
                className="relative flex items-center gap-1.5 bg-card/80 hover:bg-card border border-border/60 hover:border-primary/40 text-foreground/70 hover:text-gold text-sm font-medium px-3 rounded-md transition-all min-h-[44px] overflow-visible"
                aria-label="Grozs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Grozs</span>
                {/* Badge: gold fill, dark text, properly positioned */}
                {totalItems > 0 && (
                  <span
                    aria-label={`${totalItems} preces grozā`}
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none shadow-[0_1px_6px_oklch(0.80_0.14_78_/_0.5)] pointer-events-none"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              <a
                href={`tel:${settings.phone}`}
                data-ocid="nav.call_button"
                className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-gold text-sm font-medium px-3 rounded-md transition-all min-h-[44px]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{settings.phone}</span>
                <span className="sm:hidden">Zvanīt</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Drawer for pages that don't pass onCartOpen */}
      {!onCartOpen && (
        <CartDrawer open={localCartOpen} onOpenChange={setLocalCartOpen} />
      )}
    </>
  );
}

function Footer() {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/95 mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <span className="font-display text-2xl font-bold tracking-[0.15em] text-gold uppercase">
              SETE
            </span>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {settings.brandName} — premium sushi Rīgā
            </p>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-widest text-gold/70 mb-3">
              Darba laiks
            </h4>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold/50" />
              <span className="text-sm">{settings.workHoursText}</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-widest text-gold/70 mb-3">
              Izņemšana
            </h4>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold/50" />
              <span className="text-sm">{settings.pickupAddress}</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-widest text-gold/70 mb-3">
              Sazināties
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0 text-gold/50" />
                {settings.phone}
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0 text-gold/50" />
                {settings.email}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {currentYear} SETE. Visas tiesības aizsargātas.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/60 hover:text-gold transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  onCartOpen?: () => void;
}

export function Layout({ children, onCartOpen }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartOpen={onCartOpen} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
