import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminFetch, downloadCsv } from '../useAdminApi';
import type { EmailEntry } from '../types';

const SOURCE_COLORS: Record<string, string> = {
  newsletter: 'bg-blue-50 text-blue-700 border-blue-200',
  chatbot: 'bg-purple-50 text-purple-700 border-purple-200',
  resource: 'bg-green-50 text-green-700 border-green-200',
  comment: 'bg-orange-50 text-orange-700 border-orange-200',
  calculator: 'bg-red-50 text-red-700 border-red-200',
};

const SOURCES = ['newsletter', 'chatbot', 'resource', 'comment', 'calculator'] as const;

export default function AllEmailsTab() {
  const [allEmails, setAllEmails] = useState<EmailEntry[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAllEmails();
  }, []);

  const fetchAllEmails = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/all-emails');
      if (res.ok) {
        const data = await res.json();
        setAllEmails(data);
      }
    } catch (err) {
      console.error("Failed to fetch all emails", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    const seen = new Set<string>();
    const deduped = allEmails
      .filter(e => sourceFilter === 'all' || e.source === sourceFilter)
      .filter(e => {
        const key = e.email.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    const csv = ['Email,Source,Date,Metadata']
      .concat(deduped.map(e => `${e.email},${e.source},${e.created_at},${(e.metadata || '').replace(/,/g, ';')}`))
      .join('\n');
    downloadCsv(csv, `all-emails-${sourceFilter}.csv`);
  };

  const uniqueEmailCount = new Set(allEmails.map(e => e.email.toLowerCase())).size;
  const filtered = allEmails.filter(e => sourceFilter === 'all' || e.source === sourceFilter);

  return (
    <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">All Emails</h2>
          <p className="text-sm text-accent-light mt-1">
            Unified view across all {uniqueEmailCount} unique emails from {allEmails.length} records
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg text-sm font-bold bg-white"
          >
            <option value="all">All Sources</option>
            <option value="newsletter">Newsletter</option>
            <option value="chatbot">Chatbot</option>
            <option value="resource">Resource Gate</option>
            <option value="comment">Blog Comments</option>
            <option value="calculator">Calculator</option>
          </select>
          <button
            onClick={handleExportCsv}
            className="text-sm font-bold text-accent hover:underline"
          >
            Export CSV
          </button>
          <button
            onClick={fetchAllEmails}
            className="p-2 text-accent/40 hover:text-accent transition-colors"
            title="Refresh"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />
          </button>
        </div>
      </div>

      {/* Source breakdown chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        {SOURCES.map(source => {
          const count = allEmails.filter(e => e.source === source).length;
          const uniqueCount = new Set(allEmails.filter(e => e.source === source).map(e => e.email.toLowerCase())).size;
          if (count === 0) return null;
          return (
            <button
              key={source}
              onClick={() => setSourceFilter(sourceFilter === source ? 'all' : source)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                sourceFilter === source
                  ? 'bg-accent text-white border-accent'
                  : 'bg-muted/30 text-accent/60 border-border hover:border-accent/30'
              }`}
            >
              {source.charAt(0).toUpperCase() + source.slice(1)}: {uniqueCount} unique / {count} total
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-accent/20" size={32} /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Email</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Source</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Date</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(() => {
                const seen = new Set<string>();
                return filtered.map((entry, idx) => {
                  const emailLower = entry.email.toLowerCase();
                  const isDuplicate = seen.has(emailLower);
                  seen.add(emailLower);
                  return (
                    <tr key={idx} className={`hover:bg-muted/30 transition-colors ${isDuplicate ? 'opacity-40' : ''}`}>
                      <td className="py-4">
                        <div className="font-medium text-sm">{entry.email}</div>
                        {isDuplicate && <span className="text-[10px] text-accent/30 font-bold">DUPLICATE</span>}
                      </td>
                      <td className="py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${SOURCE_COLORS[entry.source] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {entry.source}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-mono text-accent-light">{new Date(entry.created_at).toLocaleString()}</td>
                      <td className="py-4 text-xs text-accent-light max-w-xs truncate">{entry.metadata || <span className="opacity-30 italic">-</span>}</td>
                    </tr>
                  );
                });
              })()}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-accent/40">No emails collected yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
