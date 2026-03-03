import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useAuth } from "../../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();
  const { actor } = useActor();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/admin" });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !actor) return;
    const ok = await login(actor, password);
    if (ok) {
      navigate({ to: "/admin" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-bold tracking-[0.15em] text-gold uppercase mb-2">
            SETE
          </h1>
          <p className="text-sm text-muted-foreground font-body">
            Admin panelis
          </p>
        </div>

        {/* Card */}
        <div className="card-dark rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-gold" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Ielogoties
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-sm font-medium">
                Parole
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  data-ocid="admin.login_input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ievadiet paroli"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="bg-input border-border pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              data-ocid="admin.login_button"
              disabled={isLoggingIn || !password.trim() || !actor}
              className="w-full bg-primary/90 hover:bg-primary text-primary-foreground font-medium gap-2"
            >
              {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoggingIn ? "Ielādē..." : "Ielogoties"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          SETE Admin — Tikai pilnvarotam personālam
        </p>
      </motion.div>
    </div>
  );
}
