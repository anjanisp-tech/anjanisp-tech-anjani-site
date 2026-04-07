import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ArrowRight, Info, AlertTriangle, TrendingDown, Clock, Users, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import { MINI_DIAGNOSTIC_URL } from '../constants';

export default function FounderTaxCalculator() {
  const [revenue, setRevenue] = useState<number>(500000);
  const [teamSize, setTeamSize] = useState<number>(5);
  const [heroicHours, setHeroicHours] = useState<number>(15);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState({
    timeLoss: 0,
    growthLoss: 0,
    frictionCost: 0,
    totalTax: 0,
    hourlyRate: 0
  });

  const calculateTax = () => {
    // Founder's effective hourly rate (Revenue / 2000 hours)
    const hourlyRate = revenue / 2000;
    
    // 1. Time Loss: Founder doing $50/hr work instead of strategic work
    const timeLoss = heroicHours * 52 * (hourlyRate - 50);
    
    // 2. Growth Loss: 20% of revenue lost due to bottlenecking
    const growthLoss = revenue * 0.20;
    
    // 3. Friction Cost: Inefficiency per team member ($5k/year)
    const frictionCost = teamSize * 5000;
    
    const totalTax = timeLoss + growthLoss + frictionCost;

    setResults({
      timeLoss: Math.max(0, timeLoss),
      growthLoss,
      frictionCost,
      totalTax,
      hourlyRate
    });
    setShowResult(true);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <Layout>
      <div className="bg-muted min-h-screen pb-24">
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
                Calculate Your <span className="text-accent">Founder Tax</span>
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
                    min="100000" 
                    max="5000000" 
                    step="50000"
                    value={revenue}
                    onChange={(e) => setRevenue(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-accent/30">
                    <span>$100K</span>
                    <span>$5M+</span>
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
                  Calculate My Founder Tax
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
                    <div className="bg-accent text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <AlertTriangle size={120} />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">Your Annual Founder Tax</h3>
                        <div className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
                          {formatCurrency(results.totalTax)}
                        </div>
                        <p className="text-white/70 text-sm max-w-md">
                          This is the hidden cost of running your business without an Operating Spine. 
                          It's the price of being the "Hero" instead of the "Architect."
                        </p>
                      </div>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                        <div className="text-accent/40 mb-3"><Clock size={20} /></div>
                        <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-1">Time Drain</div>
                        <div className="text-xl font-bold text-accent">{formatCurrency(results.timeLoss)}</div>
                        <p className="text-[10px] text-accent-light/50 mt-2">Cost of doing low-value work.</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                        <div className="text-accent/40 mb-3"><TrendingDown size={20} /></div>
                        <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-1">Growth Cap</div>
                        <div className="text-xl font-bold text-accent">{formatCurrency(results.growthLoss)}</div>
                        <p className="text-[10px] text-accent-light/50 mt-2">Lost revenue from bottlenecking.</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                        <div className="text-accent/40 mb-3"><Users size={20} /></div>
                        <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-1">Team Friction</div>
                        <div className="text-xl font-bold text-accent">{formatCurrency(results.frictionCost)}</div>
                        <p className="text-[10px] text-accent-light/50 mt-2">Cost of systemless inefficiency.</p>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-white p-8 rounded-3xl border border-accent/10 shadow-sm">
                      <h3 className="text-xl font-bold mb-4">Stop Paying the Tax.</h3>
                      <p className="text-sm text-accent-light/70 mb-6">
                        The Founder Tax isn't a cost of doing business—it's a symptom of a structural disease. 
                        Take the next step to install the Operating Spine and reclaim your time.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <a 
                          href={MINI_DIAGNOSTIC_URL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-primary flex-1 py-4"
                        >
                          Take the Free Diagnostic
                        </a>
                        <button 
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          className="btn-outline flex-1 py-4"
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
                    <p>We calculate your effective hourly rate based on revenue. Every hour you spend on "heroics" (tasks that could be delegated) is an hour you aren't spending on growth. We subtract a standard replacement cost ($50/hr) to find your net loss.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white rounded-xl border border-border flex items-center justify-center shrink-0 font-bold text-accent">02</div>
                  <div>
                    <h4 className="font-bold text-accent mb-2">The Growth Cap (Bottleneck Tax)</h4>
                    <p>Research shows that founder-led businesses without systems typically leave 15-25% of their potential revenue on the table due to missed opportunities, poor follow-up, and scaling friction. We use a conservative 20%.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white rounded-xl border border-border flex items-center justify-center shrink-0 font-bold text-accent">03</div>
                  <div>
                    <h4 className="font-bold text-accent mb-2">Systemic Inefficiency</h4>
                    <p>Without an Operating Spine, team members spend 15-20% of their time clarifying tasks, searching for information, or re-doing work. We estimate this cost at $5,000 per team member per year.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
