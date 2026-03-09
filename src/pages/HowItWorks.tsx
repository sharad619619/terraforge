import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Globe, Cpu, MapPin, Target } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const steps = [
  { icon: Globe, num: "01", title: "Collect Multi-Source Earth Data", desc: "TerraForge aggregates satellite imagery (multispectral & SAR), geological survey maps, digital elevation models, geochemical samples, and historical exploration records into a unified data pipeline.", details: ["Satellite imagery (Sentinel, Landsat, commercial)", "Geological survey maps & reports", "DEM terrain models", "Geochemical & geophysical datasets"] },
  { icon: Cpu, num: "02", title: "AI Detects Geological Patterns", desc: "Our proprietary deep learning models analyze complex geological signatures across multiple data layers simultaneously, identifying patterns invisible to human interpretation.", details: ["Multi-layer convolutional neural networks", "Spectral signature analysis", "Structural geology pattern recognition", "Anomaly detection algorithms"] },
  { icon: MapPin, num: "03", title: "Predict Mineral-Rich Zones", desc: "The AI generates high-resolution probability maps ranking potential mineral deposits by confidence score, deposit type, and estimated resource potential.", details: ["Probability heatmaps", "Confidence scoring per zone", "Mineral type classification", "Depth estimation models"] },
  { icon: Target, num: "04", title: "Guide Precise Drilling Decisions", desc: "Exploration teams receive ranked drilling targets with explainable AI reasoning, reducing drilling risk and optimizing exploration budgets.", details: ["Ranked drill target recommendations", "Explainable AI reasoning reports", "Cost-benefit analysis per target", "Drill plan optimization"] },
];

export default function HowItWorksPage() {
  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight">
          <motion.div className="max-w-3xl mx-auto text-center mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">How TerraForge Works</h1>
            <p className="text-lg text-muted-foreground">From raw earth observation data to actionable exploration intelligence in four steps.</p>
          </motion.div>

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div key={step.num} className="glass-card p-8 grid md:grid-cols-[80px_1fr] gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.1 }}>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-muted-foreground/30">{step.num}</span>
                  <div className="w-12 h-12 rounded-xl bg-geo-blue/10 flex items-center justify-center mt-2">
                    <step.icon size={24} className="text-geo-blue" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{step.desc}</p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {step.details.map((d) => (
                      <li key={d} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-forge-orange shrink-0" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
