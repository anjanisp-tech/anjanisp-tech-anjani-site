import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { adminPost } from '../useAdminApi';
import type { AiDebugResult } from '../types';

export default function AiDebugTab() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AiDebugResult>({ response: '', context: '', status: 'idle' });

  const handleAiDebug = async () => {
    if (!query.trim()) return;
    setResult({ ...result, status: 'loading' });
    try {
      const res = await adminPost('/api/admin/ai-debug', { message: query });
      const data = await res.json();
      if (res.ok) {
        setResult({ response: data.response, context: data.context, status: 'success' });
      } else {
        setResult({ response: `Error: ${data.error || "Unknown error"}`, context: '', status: 'error' });
      }
    } catch {
      setResult({ response: "Network error during AI debug.", context: '', status: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <MessageSquare className="text-accent" size={24} /> AI Proxy Debugger
        </h2>
        <p className="text-accent-light mb-8">
          Test how the AI responds using your current Knowledge Base context. This helps verify your "Personal Brand Moat" is functioning correctly.
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Test Query</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a methodology question..."
                className="flex-1 px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all text-sm"
                onKeyDown={(e) => e.key === 'Enter' && result.status !== 'loading' && handleAiDebug()}
              />
              <button
                onClick={handleAiDebug}
                disabled={result.status === 'loading'}
                className="btn-primary px-8 py-3 disabled:opacity-50"
              >
                {result.status === 'loading' ? 'Testing...' : 'Test AI'}
              </button>
            </div>
          </div>

          {result.status !== 'idle' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-4">AI Response</h3>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {result.response}
                </div>
              </div>

              <div className="p-6 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 font-mono text-[10px]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 font-sans">Context Used (Knowledge Base Snippet)</h3>
                <div className="max-h-60 overflow-y-auto custom-scrollbar leading-relaxed">
                  {result.context || "No context found in Knowledge Base."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
