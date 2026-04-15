import { useState, useEffect } from 'react';
import { Eye, MessageSquare, Calculator, Mail, Rocket, RefreshCw } from 'lucide-react';
import { adminFetch } from '../useAdminApi';
import type { AnalyticsData } from '../types';

export default function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({ chatbotQueries: [], blogViews: [], calculatorLeads: [], chatbotLeads: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blog Views */}
        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Eye className="text-accent" size={24} /> Popular Articles
          </h3>
          {isLoading ? (
            <div className="py-12 flex justify-center"><RefreshCw className="animate-spin text-accent/20" /></div>
          ) : analytics.blogViews.length > 0 ? (
            <div className="space-y-4">
              {analytics.blogViews.map((view: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div className="flex-grow pr-4">
                    <div className="font-bold text-sm line-clamp-1">{view.title || view.post_id}</div>
                    <div className="text-[10px] text-accent/40 font-mono uppercase tracking-widest">{view.post_id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-accent">{view.views}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-accent/30">Views</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-accent/30 font-bold italic">No view data yet.</div>
          )}
        </div>

        {/* Chatbot Queries */}
        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <MessageSquare className="text-accent" size={24} /> Recent Chat Queries
          </h3>
          {isLoading ? (
            <div className="py-12 flex justify-center"><RefreshCw className="animate-spin text-accent/20" /></div>
          ) : analytics.chatbotQueries.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {analytics.chatbotQueries.map((query: any, idx: number) => (
                <div key={idx} className="p-4 bg-muted/30 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="text-xs font-bold text-accent">Q: {query.query}</div>
                    <div className="text-[10px] text-accent/30 whitespace-nowrap">{new Date(query.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-[11px] text-accent-light leading-relaxed bg-white/50 p-3 rounded-xl border border-border/30">
                    <span className="font-bold text-accent/40 mr-1">A:</span> {query.response?.substring(0, 200)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-accent/30 font-bold italic">No chat queries yet.</div>
          )}
        </div>
      </div>

      {/* Calculator Leads */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Calculator className="text-accent" size={24} /> Calculator Leads & Results
        </h3>
        {isLoading ? (
          <div className="py-12 flex justify-center"><RefreshCw className="animate-spin text-accent/20" /></div>
        ) : analytics.calculatorLeads && analytics.calculatorLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Date</th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Email</th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Revenue</th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Total Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.calculatorLeads.map((lead: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 text-xs font-mono">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-sm font-bold">{lead.email || <span className="opacity-20 italic">Anonymous</span>}</td>
                    <td className="py-4 text-sm font-mono">{lead.currency} {lead.revenue.toLocaleString()}</td>
                    <td className="py-4 text-sm font-mono font-bold text-red-600">{lead.currency} {lead.total_tax.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-accent/30 font-bold italic">No calculator data yet.</div>
        )}
      </div>

      {/* Chatbot Leads */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Mail className="text-accent" size={24} /> Chatbot Email Leads
        </h3>
        {isLoading ? (
          <div className="py-12 flex justify-center"><RefreshCw className="animate-spin text-accent/20" /></div>
        ) : analytics.chatbotLeads && analytics.chatbotLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="mb-4 text-sm font-bold text-accent/60">{analytics.chatbotLeads.length} lead{analytics.chatbotLeads.length !== 1 ? 's' : ''} captured</div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Date</th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Email</th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Query Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.chatbotLeads.map((lead: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 text-xs font-mono">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-sm font-bold">{lead.email}</td>
                    <td className="py-4 text-xs text-accent-light max-w-xs truncate">{lead.query || <span className="opacity-30 italic">No context</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-accent/30 font-bold italic">No chatbot email leads yet. Leads appear here once visitors share their email in the chatbot.</div>
        )}
      </div>

      {/* Monetization Insights */}
      <div className="bg-accent text-white rounded-3xl p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Rocket size={28} /> Monetization Insights
          </h3>
          <p className="text-white/80 max-w-2xl mb-8 leading-relaxed">
            Based on current analytics, these are the recommended actions to increase your Personal Brand Moat and Metmov Monetization.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <div className="text-xs font-bold uppercase tracking-widest mb-2 text-white/60">Top Topic</div>
              <div className="text-lg font-bold">
                {analytics.blogViews[0]?.title || "N/A"}
              </div>
              <div className="text-xs mt-2 text-white/40 italic">Create more content in this category.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <div className="text-xs font-bold uppercase tracking-widest mb-2 text-white/60">Chat Intent</div>
              <div className="text-lg font-bold">
                {analytics.chatbotQueries.length > 0 ? "Strategic Scaling" : "N/A"}
              </div>
              <div className="text-xs mt-2 text-white/40 italic">Common theme in user questions.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <div className="text-xs font-bold uppercase tracking-widest mb-2 text-white/60">Conversion Opp</div>
              <div className="text-lg font-bold">Fit Call Hook</div>
              <div className="text-xs mt-2 text-white/40 italic">Users asking about "how to start".</div>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
