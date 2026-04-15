import { useState, useEffect } from 'react';
import { Users, Mail, MessageSquare, FileText, RefreshCw, Calculator } from 'lucide-react';
import { adminFetch } from '../useAdminApi';
import type { DashboardData, AdminTab } from '../types';

interface Props {
  onNavigate: (tab: AdminTab) => void;
}

export default function DashboardTab({ onNavigate }: Props) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !dashboard) {
    return (
      <div className="py-20 flex justify-center">
        <RefreshCw className="animate-spin text-accent/20" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Unique Emails', value: dashboard.totalEmails, icon: <Users size={20} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Subscribers', value: dashboard.subscribers, icon: <Mail size={20} />, color: 'text-green-600 bg-green-50' },
          { label: 'Comments', value: dashboard.totalComments, icon: <MessageSquare size={20} />, color: 'text-orange-600 bg-orange-50' },
          { label: 'Blog Posts', value: dashboard.totalPosts, icon: <FileText size={20} />, color: 'text-purple-600 bg-purple-50' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className={`p-2 rounded-xl ${kpi.color}`}>{kpi.icon}</span>
            </div>
            <div className="text-3xl font-bold">{kpi.value}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Activity + Source Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">7-Day Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-accent/40" />
                <span className="font-bold text-sm">Chatbot Queries</span>
              </div>
              <span className="text-2xl font-bold">{dashboard.chatbotQueries7d}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Calculator size={18} className="text-accent/40" />
                <span className="font-bold text-sm">Calculator Uses</span>
              </div>
              <span className="text-2xl font-bold">{dashboard.calculatorUses7d}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Emails by Source</h3>
          <div className="space-y-3">
            {Object.entries(dashboard.emailsBySource || {}).sort((a: any, b: any) => b[1] - a[1]).map(([source, count]: any) => {
              const total = Object.values(dashboard.emailsBySource || {}).reduce((s: number, v: any) => s + v, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors: Record<string, string> = { newsletter: 'bg-blue-500', chatbot: 'bg-purple-500', resource: 'bg-green-500', comment: 'bg-orange-500', calculator: 'bg-red-500' };
              return (
                <div key={source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold capitalize">{source}</span>
                    <span className="text-accent/40">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div className={`h-2 rounded-full ${colors[source] || 'bg-gray-500'}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(dashboard.emailsBySource || {}).length === 0 && (
              <div className="text-center text-accent/30 py-4 italic">No email data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads + Top Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Recent Leads</h3>
          <div className="space-y-3">
            {(dashboard.recentEmails || []).map((e: any, idx: number) => {
              const sourceColors: Record<string, string> = { newsletter: 'bg-blue-50 text-blue-700', chatbot: 'bg-purple-50 text-purple-700', resource: 'bg-green-50 text-green-700' };
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                  <div>
                    <div className="text-sm font-bold">{e.email}</div>
                    <div className="text-[10px] text-accent/30">{new Date(e.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${sourceColors[e.source] || 'bg-gray-50 text-gray-700'}`}>{e.source}</span>
                </div>
              );
            })}
            {(dashboard.recentEmails || []).length === 0 && (
              <div className="text-center text-accent/30 py-4 italic">No leads yet</div>
            )}
          </div>
          <button onClick={() => onNavigate('all-emails')} className="mt-4 text-xs font-bold text-accent hover:underline">View all emails &rarr;</button>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Top Articles</h3>
          <div className="space-y-3">
            {(dashboard.topPosts || []).map((p: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                <div className="flex-grow pr-4"><div className="text-sm font-bold line-clamp-1">{p.title || p.post_id}</div></div>
                <div className="text-right">
                  <div className="text-lg font-bold text-accent">{p.views}</div>
                  <div className="text-[10px] text-accent/30 uppercase">views</div>
                </div>
              </div>
            ))}
            {(dashboard.topPosts || []).length === 0 && (
              <div className="text-center text-accent/30 py-4 italic">No view data yet</div>
            )}
          </div>
          <button onClick={() => onNavigate('analytics')} className="mt-4 text-xs font-bold text-accent hover:underline">View analytics &rarr;</button>
        </div>
      </div>
    </div>
  );
}
