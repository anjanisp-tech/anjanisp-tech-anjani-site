import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen">
      <section className="pt-48 pb-32 md:pt-60 md:pb-48">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-accent/40 hover:text-accent transition-colors mb-12">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-12">Privacy Policy</h1>
            
            <div className="prose prose-lg prose-accent max-w-none text-accent-light">
              <p className="font-bold">Effective Date: 21 February 2026</p>
              <p>Website: <a href="https://www.anjanipandey.com/" className="text-accent hover:underline">https://www.anjanipandey.com/</a></p>
              
              <div className="bg-muted/30 p-6 rounded-2xl border border-border mb-12">
                <p className="m-0"><strong>Owner:</strong> Anjani Sharan Pandey</p>
                <p className="m-0"><strong>Contact Email:</strong> <a href="mailto:contact@anjanipandey.com" className="text-accent hover:underline">contact@anjanipandey.com</a></p>
              </div>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">1. Introduction</h2>
              <p>
                This Privacy Policy explains how personal data is collected, used, stored, and protected when you access or interact with <a href="https://www.anjanipandey.com/" className="text-accent hover:underline">https://www.anjanipandey.com/</a>.
              </p>
              <p>
                This website operates globally and may be accessed from multiple jurisdictions, including the European Union, the United Kingdom, the United States, and other regions.
              </p>
              <p>
                By using this website, you acknowledge the practices described in this Policy.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">2. Data Controller</h2>
              <p>
                For purposes of applicable data protection laws, including the General Data Protection Regulation (GDPR), the data controller is:
              </p>
              <p>
                <strong>Anjani Sharan Pandey</strong><br />
                Email: <a href="mailto:contact@anjanipandey.com" className="text-accent hover:underline">contact@anjanipandey.com</a>
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">3. Personal Data Collected</h2>
              <h3 className="text-xl font-bold mt-8 mb-4">A. Data You Provide Voluntarily</h3>
              <p>When you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Submit a contact form</li>
                <li>Book a call</li>
                <li>Subscribe to updates</li>
                <li>Send a direct inquiry</li>
              </ul>
              <p>You may provide:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Company name</li>
                <li>Role or designation</li>
                <li>Any information voluntarily shared in your message</li>
              </ul>

              <h3 className="text-xl font-bold mt-8 mb-4">B. Automatically Collected Data</h3>
              <p>When visiting the website, certain technical information may be collected:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Time zone</li>
                <li>Pages visited</li>
                <li>Referring URL</li>
                <li>Usage patterns</li>
              </ul>
              <p>This may be collected via cookies, analytics tools, or hosting providers.</p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">4. Legal Basis for Processing (GDPR)</h2>
              <p>
                If you are located in the European Economic Area (EEA) or United Kingdom, personal data is processed under one or more of the following lawful bases:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consent</strong> — when you voluntarily submit information</li>
                <li><strong>Legitimate Interest</strong> — to operate, improve, and secure the website</li>
                <li><strong>Contractual Necessity</strong> — if you enter into a consulting engagement</li>
                <li><strong>Legal Obligation</strong> — if required under applicable law</li>
              </ul>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">5. Purpose of Data Processing</h2>
              <p>Personal data may be used to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to inquiries</li>
                <li>Schedule calls or consultations</li>
                <li>Provide requested content or updates</li>
                <li>Improve website performance</li>
                <li>Maintain website security</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>Personal data is not sold, rented, or traded.</p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">6. International Data Transfers</h2>
              <p>
                As this website operates globally, personal data may be processed or stored in countries outside your country of residence.
              </p>
              <p>
                Where applicable under GDPR, appropriate safeguards such as standard contractual clauses or reputable service providers with compliant data protection standards are relied upon.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">7. Data Retention</h2>
              <p>Personal data is retained only for as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fulfill the purpose for which it was collected</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce agreements</li>
              </ul>
              <p>If you request deletion, data will be deleted unless retention is legally required.</p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">8. Your Data Protection Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Request erasure</li>
                <li>Restrict processing</li>
                <li>Object to processing</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>To exercise these rights, contact: <a href="mailto:contact@anjanipandey.com" className="text-accent hover:underline">contact@anjanipandey.com</a></p>
              <p>
                If you are located in the EEA or UK, you also have the right to lodge a complaint with your local supervisory authority.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">9. Cookies and Analytics</h2>
              <p>This website may use:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Essential cookies</li>
                <li>Analytics services such as Google Analytics or similar tools</li>
              </ul>
              <p>Cookies may collect anonymized traffic data. You may disable cookies through browser settings.</p>
              <p>Where required by law, cookie consent mechanisms may be implemented.</p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">10. Data Security</h2>
              <p>
                Reasonable administrative, technical, and physical safeguards are implemented to protect personal data.
              </p>
              <p>
                However, no online transmission method is completely secure. Users submit data at their own discretion.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">11. Third-Party Service Providers</h2>
              <p>The website may use third-party services such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hosting providers</li>
                <li>Analytics platforms</li>
                <li>Scheduling tools</li>
                <li>Email service providers</li>
              </ul>
              <p>
                These providers process data solely to support website functionality and are expected to maintain appropriate data protection standards.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">12. Children’s Privacy</h2>
              <p>
                This website is not intended for individuals under 18 years of age. Personal data from minors is not knowingly collected.
              </p>

              <h2 className="text-2xl font-bold text-accent mt-12 mb-6">13. Updates to This Policy</h2>
              <p>
                This Privacy Policy may be updated periodically. The effective date will reflect the latest revision.
              </p>
              <p>
                Continued use of the website constitutes acceptance of updates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
