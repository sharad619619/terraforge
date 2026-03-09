import Layout from "@/components/Layout";

export default function Cookies() {
  return (
    <Layout>
      <section className="section-spacing">
        <div className="container-tight max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: March 2026</p>
            <h2 className="text-xl font-semibold text-foreground">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience.</p>
            <h2 className="text-xl font-semibold text-foreground">Essential Cookies</h2>
            <p>Required for basic site functionality including authentication, security, and session management.</p>
            <h2 className="text-xl font-semibold text-foreground">Analytics Cookies</h2>
            <p>Help us understand how visitors interact with our website to improve our services.</p>
            <h2 className="text-xl font-semibold text-foreground">Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Disabling essential cookies may affect site functionality.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
