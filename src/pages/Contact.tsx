import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! Our team will be in touch within 24 hours.");
    setForm({ name: "", email: "", company: "", message: "" });
  };

  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight">
          <motion.div className="max-w-3xl mx-auto text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">Ready to transform your exploration workflow? Our team is here to help.</p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-12">
            <motion.form onSubmit={handleSubmit} className="glass-card p-8 space-y-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 rounded-lg bg-secondary border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-geo-blue" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 rounded-lg bg-secondary border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-geo-blue" placeholder="you@company.com" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full h-11 rounded-lg bg-secondary border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-geo-blue" placeholder="Company name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg bg-secondary border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-geo-blue resize-none" placeholder="Tell us about your exploration needs..." />
              </div>
              <Button variant="hero" size="lg" type="submit" className="w-full">Send Message</Button>
            </motion.form>

            <motion.div className="space-y-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
              {[
                { icon: Mail, label: "Sales", value: "sales@terraforge.ai" },
                { icon: Mail, label: "Support", value: "support@terraforge.ai" },
                { icon: MapPin, label: "Office", value: "San Francisco, CA" },
                { icon: Phone, label: "Phone", value: "+1 (415) 555-0142" },
              ].map((item) => (
                <div key={item.label} className="glass-card p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-geo-blue/10 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-geo-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
