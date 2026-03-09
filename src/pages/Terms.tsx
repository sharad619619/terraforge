import Layout from "@/components/Layout";

export default function Terms() {
  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: March 2026</p>
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using TerraForge AI services, you agree to be bound by these Terms of Service.</p>
            <h2 className="text-xl font-semibold text-foreground">2. Service Description</h2>
            <p>TerraForge provides AI-powered geospatial intelligence services for mineral exploration and geological analysis.</p>
            <h2 className="text-xl font-semibold text-foreground">3. User Responsibilities</h2>
            <p>Users are responsible for maintaining account security and ensuring compliance with applicable laws in their jurisdiction.</p>
            <h2 className="text-xl font-semibold text-foreground">4. Intellectual Property</h2>
            <p>All platform content, algorithms, and AI models remain the intellectual property of TerraForge AI Inc.</p>
            <h2 className="text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>TerraForge provides geological predictions as decision-support tools. Final exploration decisions remain the responsibility of the user.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
