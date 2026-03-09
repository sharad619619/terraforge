import Layout from "@/components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: March 2026</p>
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide directly, including name, email, company information, and usage data when you interact with our platform.</p>
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Information</h2>
            <p>We use collected information to provide, maintain, and improve our services, communicate with you, and ensure platform security.</p>
            <h2 className="text-xl font-semibold text-foreground">3. Data Security</h2>
            <p>We implement industry-standard security measures including encryption at rest and in transit, SOC 2 Type II compliance, and regular security audits.</p>
            <h2 className="text-xl font-semibold text-foreground">4. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. You may request deletion at any time.</p>
            <h2 className="text-xl font-semibold text-foreground">5. Contact</h2>
            <p>For privacy inquiries, contact privacy@terraforge.ai.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
