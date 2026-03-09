import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useState } from "react";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const plans = [
  {
    name: "Starter", desc: "For exploration teams getting started with AI-powered analysis.",
    monthly: "$2,400", yearly: "$2,000",
    features: ["5 exploration regions", "Basic AI analysis", "Standard support", "Monthly reports", "Email alerts", "Data export (CSV)"],
  },
  {
    name: "Professional", desc: "For mining companies requiring advanced AI models and integrations.",
    monthly: "$7,500", yearly: "$6,250",
    popular: true,
    features: ["25 exploration regions", "Advanced AI models", "Priority support", "Real-time dashboards", "API access", "Custom reports", "Team collaboration", "SSO integration"],
  },
  {
    name: "Enterprise", desc: "For government agencies and large-scale operations.",
    monthly: "Custom", yearly: "Custom",
    features: ["Unlimited regions", "Custom AI models", "Dedicated support", "On-premise deployment", "SLA guarantee", "Custom integrations", "Advanced security", "Training & onboarding"],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight">
          <motion.div className="max-w-3xl mx-auto text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Pricing</h1>
            <p className="text-lg text-muted-foreground mb-8">Scale from pilot to enterprise deployment with transparent pricing.</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 glass-card px-4 py-2">
              <span className={`text-sm ${!yearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>Monthly</span>
              <button onClick={() => setYearly(!yearly)} className="w-12 h-6 rounded-full bg-secondary relative transition-colors" style={{ backgroundColor: yearly ? "hsl(var(--geo-blue))" : undefined }}>
                <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${yearly ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-sm ${yearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>Yearly <span className="text-forge-orange text-xs">Save 17%</span></span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} className={`glass-card p-8 relative ${plan.popular ? "border-forge-orange/30 ring-1 ring-forge-orange/20" : ""}`} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.1 }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forge-orange text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{yearly ? plan.yearly : plan.monthly}</span>
                  {plan.monthly !== "Custom" && <span className="text-muted-foreground text-sm">/mo</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-forge-orange shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? "hero" : "hero-outline"} className="w-full" asChild>
                  <Link to="/contact">{plan.monthly === "Custom" ? "Contact Sales" : "Get Started"}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
