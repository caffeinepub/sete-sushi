import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "../components/Layout";
import { useSettings } from "../hooks/useSettings";

const features = [
  {
    icon: Star,
    title: "Premium kvalitāte",
    desc: "Tikai svaigākie sastāvdaļi no uzticamiem piegādātājiem",
  },
  {
    icon: Clock,
    title: "Ātrā piegāde",
    desc: "Svaigas suši jūsu durvis Rīgā",
  },
  {
    icon: MapPin,
    title: "Izņemšana klātienē",
    desc: "Blaumaņa 34-2, Rīga — ērti un ātri",
  },
];

export function HomePage() {
  const { settings } = useSettings();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-bg.dim_1920x1080.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />

        {/* Decorative lines */}
        <div className="absolute top-1/4 left-0 w-24 h-px bg-gradient-to-r from-transparent to-primary/40" />
        <div className="absolute bottom-1/3 right-0 w-24 h-px bg-gradient-to-l from-transparent to-primary/40" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-xs sm:text-sm font-body uppercase tracking-[0.3em] text-gold/70 mb-6">
              Premium Sushi Rīgā
            </p>
            <h1 className="font-display text-7xl sm:text-8xl md:text-[10rem] font-bold tracking-[0.08em] text-foreground mb-4 leading-none">
              SETE
            </h1>
            <p className="font-body text-base sm:text-lg text-muted-foreground max-w-md mx-auto mb-2">
              {settings.brandName} — mākslinieciski veidotas suši kompozīcijas
            </p>
            <p className="font-body text-sm text-muted-foreground/60 mb-10">
              {settings.workHoursText}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-primary/90 hover:bg-primary text-primary-foreground font-medium gap-2 px-8 hover:shadow-gold transition-all"
            >
              <Link to="/offers">
                Apskatīt piedāvājumus
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border/60 hover:border-primary/40 text-foreground/80 hover:text-foreground px-8"
            >
              <a href={`tel:${settings.phone}`}>Zvanīt: {settings.phone}</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-3">
            Kāpēc izvēlēties SETE?
          </h2>
          <div className="w-16 h-0.5 bg-primary/50 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-dark rounded-lg p-6 text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 border-y border-border/30">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              Gatavs pasūtīt?
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Apskatiet mūsu piedāvājumus un izvēlieties sev tīkamāko
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary/90 hover:bg-primary text-primary-foreground font-medium gap-2 hover:shadow-gold transition-all"
            >
              <Link to="/offers">
                Skatīt piedāvājumus
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
