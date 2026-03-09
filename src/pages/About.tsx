import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import logo from "@/assets/terraforge-logo.jpeg";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const team = [
  { name: "Dr. Sarah Chen", role: "CEO & Co-Founder", bio: "Former lead geoscientist at Rio Tinto with 15+ years in mineral exploration." },
  { name: "James Okafor", role: "CTO & Co-Founder", bio: "Ex-Google AI researcher specializing in geospatial machine learning systems." },
  { name: "Dr. Maria Santos", role: "Chief Science Officer", bio: "PhD in Remote Sensing from MIT. Pioneer in spectral analysis for mining." },
  { name: "David Kim", role: "VP Engineering", bio: "Built scalable data platforms at Planet Labs and Palantir Technologies." },
];

export default function About() {
  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight">
          <motion.div className="max-w-3xl mx-auto text-center mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <img src={logo} alt="TerraForge" className="h-12 mx-auto mb-6 rounded" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">About TerraForge</h1>
            <p className="text-lg text-muted-foreground">We're building the intelligence layer for earth's subsurface, making mineral exploration smarter, faster, and more sustainable.</p>
          </motion.div>

          {/* Mission */}
          <motion.div className="glass-card p-8 md:p-12 mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">To democratize access to geological intelligence by combining AI, satellite data, and geoscience expertise — reducing the cost and environmental impact of mineral exploration while accelerating the discovery of critical resources the world needs.</p>
          </motion.div>

          {/* Vision */}
          <motion.div className="glass-card p-8 md:p-12 mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">A world where every exploration decision is informed by AI — where we never drill blind, and where the transition to clean energy is accelerated by smarter mineral discovery.</p>
          </motion.div>

          {/* Team */}
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h2 className="text-3xl font-bold">Leadership Team</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {team.map((t, i) => (
              <motion.div key={t.name} className="glass-card-hover p-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.1 }}>
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4 text-xl font-bold text-geo-blue">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-sm text-forge-orange mb-2">{t.role}</p>
                <p className="text-sm text-muted-foreground">{t.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
