import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  MapPin, Layers, BarChart3, Target, Shield, Cpu,
  Globe, Database, Brain, ArrowRight, Check, Zap,
  Search, TrendingUp, FileText, ToggleLeft
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="section-spacing relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 40%, rgba(31,79,255,0.08), transparent 60%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 70% 60%, rgba(255,122,26,0.05), transparent 50%)" }} />

      <div className="container-tight relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            {/* Large Brand Name */}
            <h1 className="text-6xl sm:text-7xl lg:text-[84px] font-bold leading-[1] tracking-tight mb-4">
              <span className="bg-gradient-to-r from-geo-blue via-forge-orange to-geo-blue bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                TerraForge
              </span>
            </h1>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-6 text-balance">
              AI-Powered Mineral Intelligence for{" "}
              <span className="gradient-text">Smarter Drilling Decisions</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
              TerraForge AI transforms satellite imagery, geological layers, and terrain models into high-probability mineral predictions before expensive drilling operations begin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/demo">Request Demo <ArrowRight size={16} /></Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/platform">View Platform</Link>
              </Button>
            </div>
          </motion.div>

          {/* Product UI Mockup */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <div className="card-premium p-6 relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-forge-orange/60" />
                <div className="w-3 h-3 rounded-full bg-geo-blue/60" />
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="ml-auto text-xs text-muted-foreground">TerraForge Explorer</span>
              </div>
              {/* Map area */}
              <div className="rounded-lg bg-secondary/50 aspect-[4/3] relative overflow-hidden mb-4">
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 50%, rgba(31,79,255,0.15), transparent 60%), radial-gradient(ellipse at 65% 35%, rgba(255,122,26,0.12), transparent 50%)" }} />
                <div className="absolute inset-0 geo-grid opacity-40" />
                {/* Heatmap dots */}
                {[
                  { top: "25%", left: "35%", color: "bg-forge-orange", size: "w-6 h-6" },
                  { top: "40%", left: "50%", color: "bg-forge-orange/70", size: "w-4 h-4" },
                  { top: "55%", left: "30%", color: "bg-geo-blue", size: "w-5 h-5" },
                  { top: "35%", left: "65%", color: "bg-geo-blue/70", size: "w-3 h-3" },
                  { top: "60%", left: "55%", color: "bg-forge-orange/50", size: "w-4 h-4" },
                ].map((dot, i) => (
                  <div key={i} className={`absolute rounded-full ${dot.color} ${dot.size} blur-[2px] animate-float`} style={{ top: dot.top, left: dot.left, animationDelay: `${i * 0.8}s` }} />
                ))}
                {/* Grid lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <line x1="0" y1="33%" x2="100%" y2="33%" stroke="hsl(var(--geo-blue))" strokeWidth="0.5" />
                  <line x1="0" y1="66%" x2="100%" y2="66%" stroke="hsl(var(--geo-blue))" strokeWidth="0.5" />
                  <line x1="33%" y1="0" x2="33%" y2="100%" stroke="hsl(var(--geo-blue))" strokeWidth="0.5" />
                  <line x1="66%" y1="0" x2="66%" y2="100%" stroke="hsl(var(--geo-blue))" strokeWidth="0.5" />
                </svg>
              </div>
              {/* Score panels */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Probability", value: "87%", color: "text-forge-orange" },
                  { label: "Confidence", value: "94%", color: "text-geo-blue" },
                  { label: "Zones Found", value: "12", color: "text-foreground" },
                ].map((s) => (
                  <div key={s.label} className="glass-card p-3 text-center">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Social Proof ---------- */
function SocialProof() {
  const stats = [
    { value: "2.4M+", label: "Data Points Analyzed" },
    { value: "180+", label: "Regions Modeled" },
    { value: "1,200+", label: "Predicted Resource Zones" },
    { value: "47", label: "AI Model Layers" },
  ];

  return (
    <section className="py-16 border-y border-border/30">
      <div className="container-tight">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <p className="text-3xl sm:text-4xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Problem ---------- */
function Problem() {
  const problems = [
    { icon: Search, title: "Manual Interpretation", desc: "Geological analysis relies on slow, manual expert interpretation of fragmented datasets." },
    { icon: Database, title: "Fragmented Earth Data", desc: "Critical exploration data is scattered across incompatible formats and siloed systems." },
    { icon: Target, title: "High Failure Rates", desc: "Over 90% of exploration drilling fails to find commercially viable mineral deposits." },
    { icon: TrendingUp, title: "Costly Exploration", desc: "A single exploratory borehole can cost $500K+ with no guarantee of results." },
  ];

  return (
    <section className="section-spacing">
      <div className="container-tight">
        <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Mining exploration is expensive, slow, and uncertain.</h2>
          <p className="text-muted-foreground text-lg">Traditional methods leave billions of dollars in the ground — or waste them on dry holes.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6">
          {problems.map((p, i) => (
            <motion.div key={p.title} className="glass-card-hover p-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <p.icon size={20} className="text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Solution ---------- */
function Solution() {
  const inputs = [
    { icon: Globe, label: "Satellite Imagery" },
    { icon: MapPin, label: "Geological Maps" },
    { icon: Layers, label: "DEM Terrain Data" },
    { icon: Database, label: "Historical Exploration Data" },
  ];
  const outputs = [
    { label: "Ranked Drilling Targets" },
    { label: "Resource Probability Scores" },
    { label: "Explainable Geological Insights" },
    { label: "Exploration Risk Assessment" },
  ];

  return (
    <section className="py-[120px] relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(31,79,255,0.06), transparent 60%)" }} />
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative">
        <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">The <span className="gradient-text">TerraForge</span> Solution</h2>
          <p className="text-muted-foreground text-lg">Our AI integrates multi-source earth observation data to predict mineral-rich zones with unprecedented accuracy.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-20 items-center">
          {/* Left Column - AI Integrates */}
          <motion.div 
            className="space-y-4"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeUp} 
            custom={1}
          >
            <h3 className="text-sm font-semibold text-geo-blue uppercase tracking-wider mb-6 text-center md:text-left">AI Integrates</h3>
            <div className="space-y-4">
              {inputs.map((item, i) => (
                <motion.div 
                  key={item.label} 
                  className="glass-card p-4 flex items-center gap-3"
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp} 
                  custom={i + 2}
                >
                  <div className="w-8 h-8 rounded-lg bg-geo-blue/10 flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-geo-blue" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Center Column - AI Engine Visual */}
          <motion.div 
            className="flex items-center justify-center py-8"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeUp} 
            custom={2}
          >
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-geo-blue/20 to-forge-orange/20 blur-xl animate-pulse" style={{ transform: "scale(1.5)" }} />
              
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full border border-geo-blue/20 animate-ping" style={{ animationDuration: "3s" }} />
              <div className="absolute inset-0 rounded-full border border-forge-orange/15 animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }} />
              
              {/* Main container */}
              <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-secondary to-card flex items-center justify-center border border-border/50 shadow-lg">
                {/* Inner glow */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-geo-blue/10 to-forge-orange/10" />
                
                {/* Brain icon with glow */}
                <div className="relative">
                  <Brain size={40} className="text-forge-orange drop-shadow-lg" style={{ filter: "drop-shadow(0 0 8px rgba(255, 122, 26, 0.5))" }} />
                </div>
              </div>
              
              {/* Floating data points */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-geo-blue animate-pulse" />
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-forge-orange animate-pulse" style={{ animationDelay: "0.5s" }} />
              <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-2 h-2 rounded-full bg-geo-blue/70 animate-pulse" style={{ animationDelay: "1s" }} />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-2 h-2 rounded-full bg-forge-orange/70 animate-pulse" style={{ animationDelay: "1.5s" }} />
            </div>
          </motion.div>

          {/* Right Column - Outputs */}
          <motion.div 
            className="space-y-4"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeUp} 
            custom={3}
          >
            <h3 className="text-sm font-semibold text-forge-orange uppercase tracking-wider mb-6 text-center md:text-right">Outputs</h3>
            <div className="space-y-4">
              {outputs.map((item, i) => (
                <motion.div 
                  key={item.label} 
                  className="glass-card p-4 flex items-center gap-3"
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp} 
                  custom={i + 6}
                >
                  <div className="w-8 h-8 rounded-lg bg-forge-orange/10 flex items-center justify-center shrink-0">
                    <Check size={16} className="text-forge-orange" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- How It Works ---------- */
function HowItWorks() {
  const steps = [
    { icon: Globe, title: "Collect Multi-Source Data", desc: "Aggregate satellite imagery, geological surveys, DEM terrain data, and historical exploration records." },
    { icon: Cpu, title: "AI Detects Patterns", desc: "Deep learning models analyze geological signatures across multiple data layers." },
    { icon: MapPin, title: "Predict Mineral Zones", desc: "Generate probability maps of mineral-rich areas ranked by confidence score." },
    { icon: Target, title: "Guide Drilling Decisions", desc: "Provide actionable intelligence to optimize drill targeting and reduce exploration waste." },
  ];

  return (
    <section className="section-spacing" id="how-it-works">
      <div className="container-tight">
        <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How TerraForge Works</h2>
          <p className="text-muted-foreground text-lg">Four steps from raw earth data to actionable exploration intelligence.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.title} className="glass-card-hover p-6 text-center relative" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="absolute top-4 right-4 text-xs font-bold text-muted-foreground/40">0{i + 1}</div>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <s.icon size={22} className="text-geo-blue" />
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Use Cases ---------- */
function UseCases() {
  const cases = [
    { icon: MapPin, title: "Mining Exploration", desc: "Identify high-probability mineral deposits before committing to expensive drilling programs." },
    { icon: Shield, title: "Government Geological Surveys", desc: "Modernize national geological survey capabilities with AI-powered analysis." },
    { icon: Globe, title: "Water Resource Authorities", desc: "Locate groundwater resources using geospatial terrain and subsurface modeling." },
    { icon: Zap, title: "Energy & Infrastructure", desc: "Optimize site selection for energy projects with comprehensive geological intelligence." },
  ];

  return (
    <section className="section-spacing">
      <div className="container-tight">
        <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Enterprise Use Cases</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6">
          {cases.map((c, i) => (
            <motion.div key={c.title} className="glass-card-hover p-6 flex gap-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="w-10 h-10 rounded-lg bg-geo-blue/10 flex items-center justify-center shrink-0">
                <c.icon size={20} className="text-geo-blue" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Features Grid ---------- */
function FeaturesPreview() {
  const features = [
    { icon: MapPin, title: "Exploration Mapping" },
    { icon: Layers, title: "Intelligence Layers" },
    { icon: Brain, title: "AI Pattern Detection" },
    { icon: BarChart3, title: "Predictive Scoring" },
    { icon: Target, title: "Zone Ranking" },
    { icon: FileText, title: "Automated Reports" },
    { icon: ToggleLeft, title: "Data Dashboards" },
    { icon: Shield, title: "Explainable AI" },
  ];

  return (
    <section className="section-spacing">
      <div className="container-tight">
        <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Platform Features</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} className="glass-card-hover p-5 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <f.icon size={24} className="text-geo-blue mx-auto mb-3" />
              <p className="text-sm font-medium">{f.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing Preview ---------- */
function PricingPreview() {
  const plans = [
    { name: "Starter", price: "$2,400", period: "/mo", desc: "For exploration teams", features: ["5 exploration regions", "Basic AI analysis", "Standard support", "Monthly reports"] },
    { name: "Professional", price: "$7,500", period: "/mo", desc: "For mining companies", features: ["25 exploration regions", "Advanced AI models", "Priority support", "Real-time dashboards", "API access"], popular: true },
    { name: "Enterprise", price: "Custom", period: "", desc: "For government agencies", features: ["Unlimited regions", "Custom AI models", "Dedicated support", "On-premise option", "SLA guarantee", "Custom integrations"] },
  ];

  return (
    <section className="section-spacing" id="pricing">
      <div className="container-tight">
        <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg">Scale from pilot to enterprise deployment.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} className={`glass-card p-8 relative ${plan.popular ? "border-forge-orange/30 ring-1 ring-forge-orange/20" : ""}`} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forge-orange text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={14} className="text-forge-orange shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? "hero" : "hero-outline"} className="w-full" asChild>
                <Link to="/demo">{plan.price === "Custom" ? "Contact Sales" : "Get Started"}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
function FinalCTA() {
  return (
    <section className="section-spacing relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,122,26,0.08), transparent 50%)" }} />
      <div className="container-tight relative text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Make smarter exploration decisions with AI.</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Join leading exploration teams using TerraForge to reduce drilling risk and discover mineral resources faster.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/demo">Request Demo <ArrowRight size={16} /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export default function Index() {
  return (
    <Layout>
      <Hero />
      <SocialProof />
      <Problem />
      <Solution />
      <HowItWorks />
      <FeaturesPreview />
      <UseCases />
      <PricingPreview />
      <FinalCTA />
    </Layout>
  );
}
