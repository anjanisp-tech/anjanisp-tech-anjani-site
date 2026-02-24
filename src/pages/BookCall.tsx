import { useState } from 'react';
import { Calendar, Mail, Building, User, MessageSquare, Send, ShieldCheck, Zap, Coffee } from 'lucide-react';

export default function BookCall() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="pt-48 pb-32 md:pt-60 md:pb-48">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-8">Book a Diagnostic Call</h1>
            <p className="text-xl md:text-2xl text-accent-light mb-12 leading-relaxed">
              This 30-minute call is designed to clarify your current operating challenges, identify structural bottlenecks, and outline possible next steps for your organization. There is no obligation to move forward.
            </p>

            {/* Reassurance Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
              {[
                { icon: ShieldCheck, text: 'Strictly Confidential' },
                { icon: Coffee, text: 'No Sales Pressure' },
                { icon: Zap, text: 'Clear Next Steps' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-3 py-4 px-6 bg-muted rounded-xl border border-border/50">
                  <item.icon size={20} className="text-accent/40" />
                  <span className="text-sm font-bold uppercase tracking-wider text-accent/70">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mb-24 p-8 border border-border rounded-3xl bg-muted/30 text-left">
              <h3 className="text-xl font-bold mb-4">Why book this call?</h3>
              <p className="text-accent-light mb-0">
                You'll be speaking directly with <strong>Anjani Pandey</strong>. With 14+ years of experience scaling operations at companies like <strong>Y-Not</strong>, <strong>Udaan</strong>, and <strong>BHEL</strong>, Anjani brings a unique blend of strategic design and hands-on execution discipline to help you solve your most complex scaling challenges.
              </p>
            </div>

            <div className="space-y-24">
              {/* Calendar Section */}
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <Calendar className="text-accent" size={24} />
                  <h2 className="text-2xl font-bold mb-0">1. Schedule Your Time</h2>
                </div>
                <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                  <iframe 
                    src="https://calendly.com/metmovllp/30min?hide_landing_page_details=1&hide_gdpr_banner=1" 
                    width="100%" 
                    height="700" 
                    frameBorder="0"
                    title="Schedule a Call"
                  ></iframe>
                </div>
              </div>

              {/* Separator */}
              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-border flex-grow max-w-[100px]" />
                <span className="text-xs font-bold uppercase tracking-widest text-accent/20">OR</span>
                <div className="h-px bg-border flex-grow max-w-[100px]" />
              </div>

              {/* Contact Form Section */}
              <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <Mail className="text-accent" size={24} />
                  <h2 className="text-2xl font-bold mb-0">2. Send an Inquiry</h2>
                </div>
                
                {submitted ? (
                  <div className="bg-muted p-12 rounded-2xl border border-border text-center animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Send size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Message Sent</h3>
                    <p className="text-lg text-accent-light">We'll review your inquiry and get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/20" size={18} />
                          <input 
                            type="text" 
                            placeholder="Your Name" 
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-border focus:border-accent bg-muted/30 outline-none transition-all text-base"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/20" size={18} />
                          <input 
                            type="email" 
                            placeholder="Email Address" 
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-border focus:border-accent bg-muted/30 outline-none transition-all text-base"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Company</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/20" size={18} />
                        <input 
                          type="text" 
                          placeholder="Company Name" 
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-border focus:border-accent bg-muted/30 outline-none transition-all text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Message</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 text-accent/20" size={18} />
                        <textarea 
                          placeholder="How can we help you scale?" 
                          rows={5}
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-border focus:border-accent bg-muted/30 outline-none transition-all text-base resize-none"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary w-full py-5 text-lg shadow-xl shadow-accent/10">
                      Send Inquiry
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <section className="bg-muted border-t border-border/50 py-20">
        <div className="container-custom text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent/30 mb-0">
            Founder-Led Businesses • Structured Systems • Scalable Execution
          </p>
        </div>
      </section>
    </div>
  );
}
