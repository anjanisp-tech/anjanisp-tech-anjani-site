import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ArrowRight, Info, AlertTriangle, TrendingDown, Clock, Users, DollarSign, Globe } from 'lucide-react';
import { MINI_DIAGNOSTIC_URL, FIT_CALL_URL } from '../constants';
import SEO from '../components/SEO';

type Currency = 'USD' | 'INR';

export default function BottleneckCostCalculator() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [revenue, setRevenue] = useState<number>(500000);
  const [teamSize, setTeamSize] = useState<number>(5);
  const [heroicHours, setHeroicHours] = useState<number>(15);
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  const [results, setResults] = useState({
    timeLoss: 0,
    growthLoss: 0,
    frictionCost: 0,
    totalTax: 0,
    hourlyRate: 0
  });

  const logResults = async (userEmail?: string) => {
    try {
      await fetch('/api/analytics/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          revenue,
          teamSize,
          heroicHours,
          totalTax: results.totalTax,
          email: userEmail
        })
      });
    } catch (err) {
      console.error("Failed to log calculator results", err);
    }
  };

  // Update revenue range when currency changes
  useEffect(() => {
    if (currency === 'INR') {
      setRevenue(50000000); // 5 Cr
    } else {
      setRevenue(500000); // 500k
    }
  }, [currency]);

  const calculateTax = () => {
    // Founder's effective hourly rate (Revenue / 2000 working hours per year)
    const hourlyRate = revenue / 2000;

    // Replacement cost for delegable tasks (market rate for ops/admin help)
    const replacementCost = currency === 'USD' ? 50 : 4000;

    // 1. Time Drain: Opportunity cost of founder doing low-leverage work
    //    Every heroic hour = (founder rate - replacement rate) * 52 weeks
    const timeLoss = Math.max(0, heroicHours * 52 * (hourlyRate - replacementCost));

    // 2. Growth Cap: Revenue left on table due to founder bottleneck
    //    Base: 8% of revenue (missed opportunities from capacity constraint)
    //    Scales up with heroic hours (more firefighting = more missed growth)
    //    Scales up with team size (larger team waiting on founder = more blocked deals)
    const bottleneckIntensity = Math.min(1, (heroicHours / 40) * 0.6 + (Math.min(teamSize, 30) / 30) * 0.4);
    const growthLossRate = 0.08 + (bottleneckIntensity * 0.17); // 8% to 25% range
    const growthLoss = revenue * growthLossRate;

    // 3. Team Friction: Inefficiency cost per team member
    //    Scales with revenue-per-person (higher-value teams lose more to friction)
    //    Scales with heroic hours (more founder bottleneck = more team idle time)
    const revenuePerPerson = revenue / Math.max(teamSize, 1);
    const frictionRate = 0.05 + (Math.min(heroicHours, 40) / 40) * 0.10; // 5-15% of rev/person
    const frictionCost = teamSize * revenuePerPerson * frictionRate;

    const totalTax = timeLoss + growthLoss + frictionCost;

    const newResults = {
      timeLoss,
      growthLoss,
      frictionCost,
      totalTax,
      hourlyRate
    };

    setResults(newResults);
    setShowResult(true);

    // Log calculation (anonymous)
    logResults();

    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    await logResults(email);
    setIsSubmitting(false);
    setHasSubmittedLead(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-muted min-h-screen pb-24">
      <SEO 
        title="Bottleneck Cost Calculator | Anjani Pandey"
        description="Calculate the hidden cost of founder-dependent bottlenecks in your business. Free diagnostic tool by MetMov."
        canonical="https://www.anjanipandey.com/calculator"
      />
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-white border-b border-border">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
              <Calculator size={14} />
              Interactive Tool
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Calculate Your <span className="text-accent">Bottleneck Cost</span>
            </h1>
            <p className="text-lg text-accent-light/70 max-w-2xl mx-auto mb-10">
              Being the "Hero" of your company is costing you more than just sleep. 
              Discover the specific dollar amount you're losing by being the bottleneck.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom mt-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Info className="text-accent/40" size={24} />
              Company Vitals
            </h2>

            <div className="space-y-8">
              {/* Currency Toggle */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest text-accent/60 flex items-center gap-2">
                  <Globe size={14} />
                  Select Currency
                </label>
                <div className="flex p-1 bg-muted rounded-xl w-fit">
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currency === 'USD' ? 'bg-white text-accent shadow-sm' : 'text-accent/40 hover:text-accent'}`}
                  >
                    USD ($)
                  </button>
                  <button
                    onClick={() => setCurrency('INR')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currency === 'INR' ? 'bg-white text-accent shadow-sm' : 'text-accent/40 hover:text-accent'}`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>

              {/* Revenue Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold uppercase tracking-widest text-accent/60 flex items-center gap-2">
                    <DollarSign size={14} />
                    Annual Revenue
                  </label>
                  <span className="text-xl font-mono font-bold text-accent">{formatCurrency(revenue)}</span>
                </div>
                <input 
                  type="range" 
                  min={currency === 'USD' ? 100000 : 10000000} 
                  max={currency === 'USD' ? 5000000 : 500000000} 
                  step={currency === 'USD' ? 50000 : 10000000}
                  value={revenue}
                  onChange={(e) => setRevenue(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] font-mono text-accent/30">
                  <span>{currency === 'USD' ? '$100K' : '₹1 Cr'}</span>
                  <span>{currency === 'USD' ? '$5M+' : '₹50 Cr+'}</span>
                </div>
              </div>

              {/* Team Size Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold uppercase tracking-widest text-accent/60 flex items-center gap-2">
                    <Users size={14} />
                    Team Size
                  </label>
                  <span className="text-xl font-mono font-bold text-accent">{teamSize} People</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  step="1"
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] font-mono text-accent/30">
                  <span>1 Person</span>
                  <span>50 People</span>
                </div>
              </div>

              {/* Heroic Hours Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold uppercase tracking-widest text-accent/60 flex items-center gap-2">
                    <Clock size={14} />
                    "Heroic" Hours / Week
                  </label>
                  <span className="text-xl font-mono font-bold text-accent">{heroicHours} Hours</span>
                </div>
                <p className="text-xs text-accent-light/50 italic">
                  Hours spent on tasks others should be doing (firefighting, micro-management, admin).
                </p>
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  step="1"
                  value={heroicHours}
                  onChange={(e) => setHeroicHours(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] font-mono text-accent/30">
                  <span>0 Hours</span>
                  <span>60 Hours</span>
                </div>
              </div>

              <button 
                onClick={calculateTax}
                className="btn-primary w-full py-5 text-lg group"
              >
                Calculate My Bottleneck Cost
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </div>
          </motion.div>

          {/* Results Section */}
          <div id="results-section">
            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-3xl"
                >
                  <Calculator size={48} className="text-accent/10 mb-6" />
                  <h3 className="text-xl font-bold text-accent/30">Enter your vitals to see the cost of the bottleneck.</h3>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Total Tax Card */}
                  <div className="bg-accent text-white p-10 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <AlertTriangle size={120} />
                    </div>
                    {/* Hardware/Technical Grid Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-60">System Leak Detected</h3>
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Annual Bottleneck Tax</h3>
                      <div className="text-5xl md:text-7xl font-mono font-bold tracking-tighter mb-6">
                        {formatCurrency(results.totalTax)}
                      </div>
                      <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono opacity-40 uppercase">Severity:</span>
                          <span className={`text-[10px] font-mono uppercase font-bold tracking-widest ${results.totalTax > revenue * 0.3 ? 'text-red-400' : results.totalTax > revenue * 0.15 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {results.totalTax > revenue * 0.3 ? 'Critical' : results.totalTax > revenue * 0.15 ? 'Moderate' : 'Manageable'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono opacity-40 uppercase">Bottleneck Tax:</span>
                          <span className="text-[10px] font-mono text-white uppercase font-bold tracking-widest">{Math.round(results.totalTax / revenue * 100)}% of Revenue</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Grid */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-accent transition-colors">
                      <div className="text-accent/20 mb-3 group-hover:text-accent transition-colors"><Clock size={18} /></div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent/40 mb-1">Time Drain</div>
                      <div className="text-xl font-mono font-bold text-accent">{formatCurrency(results.timeLoss)}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-accent transition-colors">
                      <div className="text-accent/20 mb-3 group-hover:text-accent transition-colors"><TrendingDown size={18} /></div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent/40 mb-1">Growth Cap</div>
                      <div className="text-xl font-mono font-bold text-accent">{formatCurrency(results.growthLoss)}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-accent transition-colors">
                      <div className="text-accent/20 mb-3 group-hover:text-accent transition-colors"><Users size={18} /></div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent/40 mb-1">Team Friction</div>
                      <div className="text-xl font-mono font-bold text-accent">{formatCurrency(results.frictionCost)}</div>
                    </div>
                  </div>

                  {/* Lead Capture Section */}
                  <div className="bg-accent/5 p-8 md:p-10 rounded-3xl border border-accent/10 relative overflow-hidden">
                    <div className="relative z-10">
                      {!hasSubmittedLead ? (
                        <>
                          <h3 className="text-2xl font-bold mb-3">Want to fix this?</h3>
                          <p className="text-sm text-accent-light/70 mb-8 max-w-md">
                            Drop your email and we'll reach out with a custom diagnosis of your bottleneck structure and a clear next step.
                          </p>
                          <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your professional email"
                              className="flex-1 px-6 py-4 rounded-xl bg-white border border-border outline-none focus:border-accent transition-all text-sm"
                            />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-accent text-white px-8 py-4 rounded-xl font-bold hover:bg-accent-light transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                              {isSubmitting ? 'Saving...' : 'Get My Diagnosis'}
                            </button>
                          </form>
                          <p className="text-[10px] text-accent/30 mt-4 font-mono uppercase tracking-widest">
                            No spam. We'll personally review your numbers.
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowRight size={24} />
                          </div>
                          <h3 className="text-2xl font-bold mb-2">We've got your details.</h3>
                          <p className="text-accent-light/70 mb-6">Anjani will personally review your numbers. In the meantime, take the next step:</p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                              href={MINI_DIAGNOSTIC_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary py-3 px-6"
                            >
                              Take the Free Diagnostic
                            </a>
                            <a
                              href={FIT_CALL_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-outline py-3 px-6"
                            >
                              Book a Fit Call
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                    <h3 className="text-xl font-bold mb-4">Stop Paying the Tax.</h3>
                    <p className="text-sm text-accent-light/70 mb-6">
                      This isn't a cost of doing business. It's a structural disease with a known cure: the Operating Spine. Take the next step.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={FIT_CALL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex-1 py-4"
                      >
                        Book a Fit Call
                      </a>
                      <a
                        href={MINI_DIAGNOSTIC_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline flex-1 py-4"
                      >
                        Free Diagnostic
                      </a>
                      <button
                        onClick={() => {
                          setShowResult(false);
                          setHasSubmittedLead(false);
                          setEmail('');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn-outline flex-1 py-4 !text-accent/40"
                      >
                        Recalculate
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <section className="mt-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto bg-white/50 p-12 rounded-3xl border border-border/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-8 text-center">The Methodology</h3>
            <div className="space-y-8 text-sm text-accent-light/70">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white rounded-xl border border-border flex items-center justify-center shrink-0 font-bold text-accent">01</div>
                <div>
                  <h4 className="font-bold text-accent mb-2">The Opportunity Cost of Time</h4>
                  <p>We calculate your effective hourly rate based on revenue. Every hour you spend on "heroics" (tasks that could be delegated) is an hour you aren't spending on growth. We subtract a standard replacement cost to find your net loss.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white rounded-xl border border-border flex items-center justify-center shrink-0 font-bold text-accent">02</div>
                <div>
                  <h4 className="font-bold text-accent mb-2">The Growth Cap (Bottleneck Tax)</h4>
                  <p>Founder-led businesses without systems leave 8-25% of potential revenue on the table through missed opportunities and scaling friction. The rate scales with your bottleneck intensity: more heroic hours and a larger team waiting on you means a higher cap.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white rounded-xl border border-border flex items-center justify-center shrink-0 font-bold text-accent">03</div>
                <div>
                  <h4 className="font-bold text-accent mb-2">Systemic Inefficiency</h4>
                  <p>Without an Operating Spine, team members spend 5-15% of their productive value on friction: clarifying tasks, waiting for approvals, searching for information, or re-doing work. The rate increases with founder bottleneck severity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
