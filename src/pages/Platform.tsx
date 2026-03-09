import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Layers, MapPin, BarChart3, FileText, ToggleLeft } from "lucide-react";
import logo from "@/assets/terraforge-logo.jpeg";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Platform() {
  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight">
          <motion.div className="max-w-3xl mx-auto text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">TerraForge Platform</h1>
            <p className="text-lg text-muted-foreground">Simulated SaaS dashboard experience.</p>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div className="card-premium overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            {/* Top bar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-border/50">
              <img src={logo} alt="TerraForge" className="h-6 rounded" />
              <span className="text-sm font-semibold">TerraForge Explorer</span>
              <span className="ml-auto text-xs text-muted-foreground">Region: Pilbara Basin</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px]">
              {/* Map */}
              <div className="aspect-[16/10] relative overflow-hidden bg-secondary/30">
                <div className="absolute inset-0 geo-grid opacity-20" />
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 40%, rgba(255,122,26,0.18), transparent 45%), radial-gradient(ellipse at 55% 55%, rgba(31,79,255,0.12), transparent 40%), radial-gradient(ellipse at 70% 30%, rgba(255,122,26,0.1), transparent 35%)" }} />
                {/* Contour-like lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                  <ellipse cx="40%" cy="40%" rx="15%" ry="12%" fill="none" stroke="hsl(var(--forge-orange))" strokeWidth="0.5" />
                  <ellipse cx="40%" cy="40%" rx="20%" ry="16%" fill="none" stroke="hsl(var(--forge-orange))" strokeWidth="0.3" />
                  <ellipse cx="55%" cy="55%" rx="10%" ry="8%" fill="none" stroke="hsl(var(--geo-blue))" strokeWidth="0.5" />
                </svg>
                {/* Pins */}
                {[
                  { t: "35%", l: "38%", label: "A-14" },
                  { t: "52%", l: "53%", label: "B-07" },
                  { t: "28%", l: "65%", label: "C-22" },
                ].map((pin) => (
                  <div key={pin.label} className="absolute flex flex-col items-center" style={{ top: pin.t, left: pin.l }}>
                    <MapPin size={16} className="text-forge-orange" />
                    <span className="text-[10px] font-semibold bg-deep-space/80 px-1 rounded mt-0.5">{pin.label}</span>
                  </div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="border-l border-border/50 p-4 space-y-4">
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1"><Layers size={12} /> Layer Controls</p>
                  {["Geological Map", "Spectral Analysis", "DEM Terrain", "AI Predictions", "Historical Data"].map((l, i) => (
                    <div key={l} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-xs">{l}</span>
                      <div className="w-8 h-4 rounded-full bg-geo-blue/30 relative">
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full ${i < 4 ? "bg-geo-blue right-0.5" : "bg-muted-foreground left-0.5"}`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1"><BarChart3 size={12} /> Ranked Zones</p>
                  {[
                    { zone: "Zone A-14", score: "94.2%", type: "Gold-Copper" },
                    { zone: "Zone B-07", score: "87.8%", type: "Iron Ore" },
                    { zone: "Zone C-22", score: "76.1%", type: "Lithium" },
                    { zone: "Zone D-03", score: "68.5%", type: "Copper" },
                  ].map((z) => (
                    <div key={z.zone} className="py-2 border-b border-border/30 last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">{z.zone}</span>
                        <span className="text-xs font-bold text-forge-orange">{z.score}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{z.type}</span>
                    </div>
                  ))}
                </div>

                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1"><FileText size={12} /> Actions</p>
                  <button className="w-full text-xs font-medium py-2 rounded-md bg-forge-orange/10 text-forge-orange hover:bg-forge-orange/20 transition-colors mb-2">Export Report</button>
                  <button className="w-full text-xs font-medium py-2 rounded-md bg-geo-blue/10 text-geo-blue hover:bg-geo-blue/20 transition-colors">Share Analysis</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
