import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, Phone } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "../components/Layout";
import { useSettings } from "../hooks/useSettings";

export function ThanksPage() {
  const { settings } = useSettings();
  const search = useSearch({ strict: false }) as { orderId?: string };
  const orderId = search?.orderId;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-20 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-lg mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
            className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-10 h-10 text-gold" />
          </motion.div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Paldies!
          </h1>
          <p className="text-lg text-muted-foreground mb-3">
            Jūsu pasūtījums ir saņemts
          </p>

          {orderId && (
            <p className="text-xs text-muted-foreground/60 font-mono mb-6 bg-muted/20 px-3 py-1.5 rounded-md inline-block">
              #{orderId.slice(-8).toUpperCase()}
            </p>
          )}

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            {settings.deliveryNote ||
              "Mēs sazināsimies ar jums, lai precizētu piegādes laiku."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              variant="outline"
              className="border-border/60 hover:border-primary/40 gap-2"
            >
              <a href="tel:XXXX">
                <Phone className="w-4 h-4" />
                Sazināties: XXXX
              </a>
            </Button>
            <Button
              asChild
              className="bg-primary/90 hover:bg-primary text-primary-foreground gap-2"
            >
              <Link to="/offers">
                Vēl pasūtīt
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
