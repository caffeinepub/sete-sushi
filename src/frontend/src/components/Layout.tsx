import { Link, useLocation } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useSettings } from "../hooks/useSettings";

const PHONE = "XXXX";
const EMAIL = "sete.latvia@gmail.com";

function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
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
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/offers"
              data-ocid="nav.offers_link"
              className={`text-sm font-body font-medium tracking-wide transition-colors px-3 py-2 rounded-md ${
                !isHome
                  ? "text-gold"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              Piedāvājumi
            </Link>
            <a
              href={`tel:${PHONE}`}
              data-ocid="nav.call_button"
              className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-gold text-sm font-medium px-3 py-1.5 rounded-md transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{PHONE}</span>
              <span className="sm:hidden">Zvanīt</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
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
                href={`tel:${PHONE}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0 text-gold/50" />
                {PHONE}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0 text-gold/50" />
                {EMAIL}
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
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
