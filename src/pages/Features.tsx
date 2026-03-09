import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { MapPin, Layers, Brain, BarChart3, Target, FileText, ToggleLeft, Shield, Zap, Eye, Globe, Database } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const features = [
  { icon: MapPin, title: "Exploration Probability Mapping", desc: "Generate high-resolution probability maps for mineral deposits using multi-source earth observation data." },
  { icon: Layers, title: "Geospatial Intelligence Layers", desc: "Toggle between geological, spectral, topographic, and AI-generated layers for comprehensive analysis." },
  { icon: Brain, title: "AI Pattern Detection", desc: "Deep learning models trained on global geological datasets identify patterns invisible to human analysts." },
  { icon: BarChart3, title: "Predictive Resource Scoring", desc: "Every zone receives a confidence score based on geological indicators, spectral signatures, and terrain analysis." },
  { icon: Target, title: "Exploration Zone Ranking", desc: "AI ranks all identified zones by probability, estimated value, and drilling accessibility." },
  { icon: Eye, title: "Explainable AI Insights", desc: "Every prediction comes with transparent reasoning showing which geological features contributed to the score." },
  { icon: ToggleLeft, title: "Data Visualization Dashboards", desc: "Interactive dashboards with real-time data feeds, charts, and geospatial visualizations." },
  { icon: FileText, title: "Automated Geological Reports", desc: "Generate comprehensive exploration reports with maps, statistics, and AI recommendations." },
  { icon: Globe, title: "Multi-Region Analysis", desc: "Analyze exploration regions across multiple geographies simultaneously with unified data pipelines." },
  { icon: Database, title: "Data Integration Hub", desc: "Connect to existing GIS systems, geological databases, and third-party satellite providers." },
  { icon: Shield, title: "Enterprise Security", desc: "SOC 2 Type II compliant with end-to-end encryption, SSO, and granular role-based access controls." },
  { icon: Zap, title: "Real-Time Processing", desc: "Process new satellite imagery and geological data in near real-time for up-to-date exploration intelligence." },
];

export default function Features() {
  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight">
          <motion.div className="max-w-3xl mx-auto text-center mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Platform Features</h1>
            <p className="text-lg text-muted-foreground">Everything you need to transform geological data into actionable exploration intelligence.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} className="glass-card-hover p-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.05 }}>
                <div className="w-10 h-10 rounded-lg bg-geo-blue/10 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-geo-blue" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
