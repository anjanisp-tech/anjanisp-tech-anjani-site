import { useState, useEffect } from 'react';
import { adminFetch, downloadCsv } from '../useAdminApi';
import type { Subscriber } from '../types';

export default function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await adminFetch('/api/admin/subscriptions');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      console.error("Failed to fetch subscribers", err);
    }
  };

  return (
    <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
        <button
          onClick={() => {
            const csv = subscribers.map(s => s.email).join('\n');
            downloadCsv(csv, 'subscribers.csv');
          }}
          className="text-sm font-bold text-accent hover:underline"
        >
          Export to CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-4 text-xs font-bold uppercase tracking-widest text-accent/40">Email</th>
              <th className="py-4 text-xs font-bold uppercase tracking-widest text-accent/40">Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-4 font-medium">{s.email}</td>
                <td className="py-4 text-sm text-accent-light">{new Date(s.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="py-12 text-center text-accent/40">No subscribers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
