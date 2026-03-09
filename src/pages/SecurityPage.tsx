import Layout from "@/components/Layout";

export default function Security() {
  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Security Policy</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>TerraForge AI takes the security of your data seriously. Our platform is built with enterprise-grade security from the ground up.</p>
            <h2 className="text-xl font-semibold text-foreground">Infrastructure Security</h2>
            <p>SOC 2 Type II certified. All data encrypted at rest (AES-256) and in transit (TLS 1.3). Regular penetration testing and vulnerability assessments.</p>
            <h2 className="text-xl font-semibold text-foreground">Access Controls</h2>
            <p>Role-based access control (RBAC), SSO integration, multi-factor authentication, and audit logging for all platform activities.</p>
            <h2 className="text-xl font-semibold text-foreground">Data Protection</h2>
            <p>Your exploration data is isolated in dedicated environments. We never share or use customer data for model training without explicit consent.</p>
            <h2 className="text-xl font-semibold text-foreground">Reporting Vulnerabilities</h2>
            <p>If you discover a security vulnerability, please report it to security@terraforge.ai.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
