import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="bg-white min-h-screen">
      <section className="pt-48 pb-32 md:pt-60 md:pb-48">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-accent/40 hover:text-accent transition-colors mb-12">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-12">Terms of Service</h1>
            
            <div className="prose prose-lg prose-accent max-w-none text-accent-light">
              <p className="font-bold">Effective Date: 21 February 2026</p>
              <p>Website: <a href="https://www.anjanipandey.com/" className="text-accent hover:underline">https://www.anjanipandey.com/</a></p>
              
              <div className="bg-muted/30 p-6 rounded-2xl border border-border mb-12">
                <p className="m-0"><strong>Owner:</strong> Anjani Sharan Pandey</p>
                <p className="m-0"><strong>Contact Email:</strong> <a href="mailto:contact@anjanipandey.com" className="text-accent hover:underline">contact@anjanipandey.com</a></p>
              </div>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">1. Acceptance of Terms</h2>
              <p>
                By accessing or using this website, you agree to these Terms of Service.
              </p>
              <p>
                If you do not agree, please discontinue use.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">2. Nature of Content</h2>
              <p>All content provided is:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Informational</li>
                <li>Educational</li>
                <li>Reflective of professional experience</li>
              </ul>
              <p>Nothing on this website constitutes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Legal advice</li>
                <li>Financial advice</li>
                <li>Investment advice</li>
                <li>Tax advice</li>
              </ul>
              <p>
                Formal advisory relationships exist only through signed written agreements.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">3. Intellectual Property</h2>
              <p>
                All website content, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Articles</li>
                <li>Frameworks</li>
                <li>Operating models</li>
                <li>Strategic tools</li>
                <li>Visual assets</li>
              </ul>
              <p>
                is the intellectual property of Anjani Sharan Pandey unless otherwise stated.
              </p>
              <p>
                Unauthorized reproduction, modification, or commercial use is prohibited.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">4. Professional Disclaimer</h2>
              <p>
                Business, operational, and strategic insights shared on this website:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Reflect personal professional judgment</li>
                <li>Are context-dependent</li>
                <li>Do not guarantee specific outcomes</li>
              </ul>
              <p>
                Implementation decisions remain the sole responsibility of the user.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">5. External Links</h2>
              <p>
                The website may link to third-party platforms such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>LinkedIn</li>
                <li>Medium</li>
                <li>Substack</li>
                <li>Other external services</li>
              </ul>
              <p>
                No responsibility is assumed for third-party content or policies.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, the website owner shall not be liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Direct or indirect damages</li>
                <li>Loss of profits</li>
                <li>Business interruption</li>
                <li>Data loss</li>
                <li>Reliance on published content</li>
              </ul>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">7. Governing Law and Jurisdiction</h2>
              <p>
                These Terms are governed by the laws of India.
              </p>
              <p>
                Any disputes shall fall under the exclusive jurisdiction of courts in Bengaluru, Karnataka.
              </p>
              <p>
                For international users, nothing in these Terms limits rights granted under mandatory consumer protection laws in their jurisdiction.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">8. Contact</h2>
              <p>
                For any legal, privacy, or policy-related inquiries:
              </p>
              <p>
                Email: <a href="mailto:contact@anjanipandey.com" className="text-accent hover:underline">contact@anjanipandey.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
