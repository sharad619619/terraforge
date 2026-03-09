import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, MapPin, BarChart3 } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Demo() {
  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight">
          <motion.div className="max-w-3xl mx-auto text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">See TerraForge in Action</h1>
            <p className="text-lg text-muted-foreground">Explore an interactive preview of the TerraForge AI platform with sample exploration data.</p>
          </motion.div>

          {/* Platform mockup */}
          <motion.div className="card-premium p-6 mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
              <div className="w-3 h-3 rounded-full bg-forge-orange/60" />
              <div className="w-3 h-3 rounded-full bg-geo-blue/60" />
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="ml-auto text-xs text-muted-foreground">TerraForge Explorer — Demo Mode</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_280px] gap-4">
              {/* Map */}
              <div className="rounded-lg bg-secondary/50 aspect-video relative overflow-hidden">
                <div className="absolute inset-0 geo-grid opacity-30" />
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 35% 45%, rgba(255,122,26,0.15), transparent 50%), radial-gradient(ellipse at 60% 55%, rgba(31,79,255,0.1), transparent 50%)" }} />
                {/* Simulated hotspots */}
                {[
                  { t: "20%", l: "30%", s: "w-8 h-8", c: "bg-forge-orange/40" },
                  { t: "35%", l: "45%", s: "w-12 h-12", c: "bg-forge-orange/30" },
                  { t: "50%", l: "25%", s: "w-6 h-6", c: "bg-geo-blue/40" },
                  { t: "40%", l: "60%", s: "w-10 h-10", c: "bg-geo-blue/30" },
                  { t: "60%", l: "50%", s: "w-5 h-5", c: "bg-forge-orange/50" },
                ].map((d, i) => (
                  <div key={i} className={`absolute rounded-full ${d.c} ${d.s} blur-sm animate-float`} style={{ top: d.t, left: d.l, animationDelay: `${i * 1.2}s` }} />
                ))}
                <div className="absolute bottom-4 left-4 glass-card px-3 py-2 text-xs text-muted-foreground">
                  <MapPin size={12} className="inline mr-1" /> Simulated Region: Western Australia
                </div>
              </div>

              {/* Side panel */}
              <div className="space-y-3">
                <div className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Layers size={12} /> Layer Controls</p>
                  {["Geological Map", "Spectral Analysis", "Terrain DEM", "AI Predictions"].map((l) => (
                    <div key={l} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-xs">{l}</span>
                      <div className="w-7 h-4 rounded-full bg-geo-blue/30 relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-geo-blue" /></div>
                    </div>
                  ))}
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><BarChart3 size={12} /> Top Zones</p>
                  {[
                    { zone: "Zone A-14", score: "94%", color: "text-forge-orange" },
                    { zone: "Zone B-07", score: "87%", color: "text-forge-orange" },
                    { zone: "Zone C-22", score: "76%", color: "text-geo-blue" },
                  ].map((z) => (
                    <div key={z.zone} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-xs">{z.zone}</span>
                      <span className={`text-xs font-semibold ${z.color}`}>{z.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/contact">Request Full Demo <ArrowRight size={16} /></Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
