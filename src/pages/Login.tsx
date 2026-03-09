import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/terraforge-logo.jpeg";
import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Demo mode — login is not functional yet.");
  };

  return (
    <Layout hideFooter>
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logo} alt="TerraForge" className="h-10 mx-auto mb-4 rounded" />
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to the TerraForge platform</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 rounded-lg bg-secondary border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-geo-blue" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-11 rounded-lg bg-secondary border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-geo-blue" placeholder="••••••••" />
            </div>
            <Button variant="hero" size="lg" type="submit" className="w-full">Sign In</Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Don't have an account? <Link to="/contact" className="text-geo-blue hover:underline">Request access</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}
