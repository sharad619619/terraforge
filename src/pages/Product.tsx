import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Layers, Cpu, Globe, Shield, BarChart3, Database, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const modules = [
  { icon: Globe, title: "AI Exploration Engine", desc: "Multi-layer geological analysis powered by deep learning models trained on global mineral datasets." },
  { icon: Layers, title: "Geospatial Pipeline", desc: "Automated ingestion and processing of satellite imagery, DEMs, and geological survey data." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time visualization of exploration data with interactive maps and probability scoring." },
  { icon: Database, title: "Data Integration", desc: "Connect to existing geological databases, GIS systems, and third-party data providers via API." },
  { icon: Lock, title: "Enterprise Security", desc: "SOC 2 compliant infrastructure with end-to-end encryption and role-based access controls." },
  { icon: Cpu, title: "API Platform", desc: "RESTful APIs for programmatic access to predictions, reports, and geospatial data exports." },
];

export default function Product() {
  return (
    <Layout>
      <section style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="container-tight">
          <motion.div className="max-w-3xl mx-auto text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">The <span className="gradient-text">TerraForge</span> Platform</h1>
            <p className="text-lg text-muted-foreground">An end-to-end AI-powered geospatial intelligence platform that transforms raw earth observation data into actionable mineral exploration insights.</p>
          </motion.div>

          {/* Platform Capabilities */}
          <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Platform Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">TerraForge combines AI, geospatial intelligence, and exploration analytics into one integrated platform.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <motion.div 
                key={m.title} 
                className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(17,24,39,0.85)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={fade} 
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-geo-blue/10 flex items-center justify-center mb-4">
                  <m.icon size={20} className="text-geo-blue" />
                </div>
                <h3 className="font-semibold mb-2">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button variant="hero" size="xl" asChild>
              <Link to="/demo">Request a Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
