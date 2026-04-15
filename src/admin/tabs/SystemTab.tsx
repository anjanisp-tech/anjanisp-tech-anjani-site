import { useState, useEffect } from 'react';
import { Database, Rocket, RefreshCw, FileText, Mail, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminFetch, adminPost, getSecret } from '../useAdminApi';

export default function SystemTab() {
  const [audits, setAudits] = useState<any[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [diagnostic, setDiagnostic] = useState<any>(null);

  useEffect(() => {
    fetchAudits();
    fetch('/api/diagnostic')
      .then(res => res.json())
      .then(data => setDiagnostic(data))
      .catch(err => console.error("Diagnostic fetch failed", err));
  }, []);

  const fetchAudits = async () => {
    try {
      const res = await adminFetch('/api/admin/audits');
      if (res.ok) {
        const data = await res.json();
        setAudits(data);
      }
    } catch (err) {
      console.error("Failed to fetch audits:", err);
    }
  };

  const handleInitDb = async () => {
    try {
      const res = await adminPost('/api/admin/init-db');
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Database initialized successfully.");
      } else {
        const data = await res.json();
        alert("Initialization failed: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Network error during initialization.");
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await adminPost('/api/admin/audit');
      const data = await res.json().catch(() => ({ error: "Unknown error" }));
      if (res.ok) {
        fetchAudits();
      } else {
        alert(`Audit failed: ${data.error || "Unknown error"}${data.details ? ` (${data.details})` : ""}`);
      }
    } catch {
      alert("Network error during audit.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDownloadArchitecture = () => {
    window.open('/ARCHITECTURE.md', '_blank');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Database Management */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Database Management</h2>
        <div className="p-6 bg-muted/30 rounded-2xl border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Initialize Database</h3>
              <p className="text-xs text-accent-light mt-1">
                Create missing tables and ensure the schema is up to date.
                Safe to run multiple times.
              </p>
            </div>
            <button
              onClick={handleInitDb}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-light transition-all shadow-lg"
            >
              <Database size={18} /> Initialize DB
            </button>
          </div>
        </div>
      </div>

      {/* Self-Audit System */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Self-Audit System</h2>
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-light transition-all shadow-lg disabled:opacity-50"
          >
            {isAuditing ? <RefreshCw size={18} className="animate-spin" /> : <Rocket size={18} />}
            Run Audit
          </button>
        </div>

        <div className="space-y-4">
          {audits.length === 0 ? (
            <div className="p-12 text-center text-accent/40 bg-muted/30 rounded-2xl border border-dashed border-border">
              No audit history found. Run your first audit to check system health.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-widest text-accent/40 border-b border-border">
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((audit) => {
                    const details = JSON.parse(audit.details);
                    return (
                      <tr key={audit.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-4 text-sm font-medium">{new Date(audit.created_at).toLocaleString()}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            audit.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {audit.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(details.checks).map(([name, check]: [string, any]) => (
                              <div key={name} className="flex items-center gap-2 text-[10px]">
                                <div className={`w-2 h-2 rounded-full ${check.status === 'ok' ? 'bg-green-500' : (check.status === 'warning' ? 'bg-amber-500' : 'bg-red-500')}`} />
                                <span className="font-bold uppercase opacity-60">{name}:</span>
                                <span className={check.status === 'ok' ? 'text-green-600' : (check.status === 'warning' ? 'text-amber-600' : 'text-red-600')}>
                                  {check.status === 'ok' ? (check.type || 'OK') : (check.message || 'Error')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Documentation</h2>
        <div className="p-6 bg-muted/30 rounded-2xl border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Architecture Reference</h3>
              <p className="text-xs text-accent-light mt-1">
                Download the latest version of the Application Architecture & Sitemap (Markdown format).
              </p>
            </div>
            <button
              onClick={handleDownloadArchitecture}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-border text-accent rounded-xl font-bold hover:bg-muted transition-all shadow-sm"
            >
              <FileText size={18} /> Download .md
            </button>
          </div>
        </div>
      </div>

      {/* Environment & Credentials */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Environment & Credentials</h2>
        <div className="space-y-6">
          <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Info className="text-accent" size={18} /> Knowledge Base Setup Guide
            </h3>
            <div className="space-y-4 text-xs text-accent-light leading-relaxed">
              <p>To enable the AI Knowledge Base, you must provide Google Service Account credentials in the <b>Settings &rarr; Secrets</b> menu of AI Studio:</p>
              <ol className="list-decimal ml-4 space-y-2">
                <li>Create a Service Account in <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" className="text-accent underline">Google Cloud Console</a>.</li>
                <li>Generate a <b>JSON Key</b> for that account.</li>
                <li>Copy <code>client_email</code> to <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>.</li>
                <li>Copy <code>private_key</code> to <code>GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code>.</li>
                <li>Share your Google Doc with the Service Account email as a <b>Viewer</b>.</li>
                <li>Copy the Doc ID to <code>GOOGLE_DRIVE_KNOWLEDGE_FILE_ID</code> (or set it in the Knowledge tab).</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* System Controls */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">System Controls</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Email Notifications */}
          <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Mail className="text-accent" size={20} /> Email Notifications
            </h3>
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Status:</span>
              <span id="resend-status" className="px-2 py-0.5 rounded bg-muted text-accent/60">Checking...</span>
            </div>
            <p className="text-sm text-accent-light">
              Verify your Resend configuration by sending a test email. Note: Free tier accounts can only send to their verified email address.
            </p>

            <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border/50">
              <label className="text-[10px] font-bold uppercase tracking-widest text-accent/40 block mb-2">Manual Key Override</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  id="manual-resend-key"
                  placeholder="re_..."
                  className="flex-1 px-3 py-2 text-xs rounded border border-border outline-none focus:border-accent"
                />
                <button
                  onClick={async () => {
                    const input = document.getElementById('manual-resend-key') as HTMLInputElement;
                    const key = input.value.trim();
                    if (!key) return alert("Please enter a key");
                    try {
                      const res = await adminPost('/api/admin/save-resend-key', { key });
                      const data = await res.json();
                      if (res.ok) {
                        let msg = data.message;
                        if (data.warning) msg += "\n\nWarning: " + data.warning;
                        alert(msg);
                        window.location.reload();
                      } else {
                        alert("Error: " + (data.error || "Unknown error"));
                      }
                    } catch {
                      alert("Failed to save key");
                    }
                  }}
                  className="px-3 py-2 bg-accent text-white text-[10px] font-bold rounded hover:bg-accent-light transition-colors"
                >
                  Save
                </button>
              </div>
              <p className="text-[9px] text-accent/40 mt-2 italic">
                Use this if AI Studio Secrets are not being detected. Note: Overrides may reset on server restart. For permanent setup, use AI Studio Secrets.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button
                id="test-email-btn"
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  btn.disabled = true;
                  btn.innerText = "Sending...";
                  try {
                    const res = await adminPost('/api/admin/test-email');
                    const data = await res.json();
                    if (res.ok) alert("Success: " + data.message);
                    else {
                      let msg = data.error || "Unknown error";
                      if (data.details) msg += "\n\nDetails: " + data.details;
                      alert("Error: " + msg);
                    }
                  } catch {
                    alert("Network error sending test email.");
                  } finally {
                    btn.disabled = false;
                    btn.innerText = "Send Test Email";
                  }
                }}
                className="btn-primary w-full py-3 text-sm disabled:opacity-50"
              >
                Send Test Email
              </button>

              <button
                onClick={async (e) => {
                  if (!confirm("This will kill the server process to force a reload of environment variables. The app will be offline for a few seconds. Continue?")) return;
                  const btn = e.currentTarget;
                  btn.disabled = true;
                  btn.innerText = "Restarting...";
                  try {
                    const res = await adminPost('/api/admin/restart-server');
                    const data = await res.json();
                    alert(data.message);
                    setTimeout(() => window.location.reload(), 3000);
                  } catch {
                    alert("Server is restarting...");
                    setTimeout(() => window.location.reload(), 3000);
                  }
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors py-2 border border-red-500/20 rounded-lg hover:bg-red-50"
              >
                Hard Restart Server
              </button>
            </div>
          </div>

          {/* System Health & Env */}
          <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="text-accent" size={20} /> System Health & Env
            </h3>

            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Database:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {diagnostic?.dbStatus || 'Checking...'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs mb-4">
              <span className="font-bold uppercase tracking-wider">Resend:</span>
              <span className={`px-2 py-0.5 rounded ${diagnostic?.env?.HAS_RESEND ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
                {diagnostic?.env?.HAS_RESEND ? 'Configured' : 'Missing or Invalid API Key'}
              </span>
            </div>

            {diagnostic?.env && (
              <div className="space-y-4">
                <div className="p-4 bg-black/5 rounded-2xl border border-black/10 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent/40">Status Summary</h4>
                  <div className="text-[10px] font-mono space-y-1">
                    <div className="flex justify-between"><span>GEMINI_KEY:</span> <span className={diagnostic.env.HAS_GEMINI ? 'text-green-600 font-bold' : 'text-red-500'}>{diagnostic.env.HAS_GEMINI ? `PRESENT (${diagnostic.env.GEMINI_KEY_MASKED})` : 'MISSING'}</span></div>
                    <div className="flex justify-between"><span>KNOWLEDGE:</span> <span>{diagnostic.knowledgeStatus}</span></div>
                    <div className="flex justify-between"><span>GEMINI_TEST:</span> <span className={diagnostic.geminiTest.includes('Success') ? 'text-green-600' : 'text-amber-600'}>{diagnostic.geminiTest}</span></div>
                    <div className="flex justify-between"><span>VERSION:</span> <span>{diagnostic.version}</span></div>
                    <div className="flex justify-between"><span>UPTIME:</span> <span>{Math.floor(diagnostic.serverStartTime / 60)}m {Math.floor(diagnostic.serverStartTime % 60)}s</span></div>
                  </div>
                </div>

                <div className="p-4 bg-black/5 rounded-2xl border border-black/10 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent/40">Environment Keys (Debug)</h4>
                  <div className="text-[10px] font-mono space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {diagnostic.env.ENV_KEYS.map((k: any) => (
                      <div key={k.key} className="flex justify-between gap-4">
                        <span className={k.present ? 'text-green-700 font-bold' : 'text-red-400'}>{k.key}:</span>
                        <span className="text-right">{k.present ? `PRESENT (${k.length} chars, ${k.preview})` : 'MISSING'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border/50">
              <p className="text-[10px] text-accent-light mb-4">
                Force update blog titles and structure across the database to match the latest system standards.
              </p>
              <button
                id="sync-btn"
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  btn.disabled = true;
                  btn.innerText = "Syncing...";
                  try {
                    const res = await adminFetch('/api/diagnostic?force=true');
                    const data = await res.json();
                    if (res.ok) {
                      alert(`Sync complete! DB: ${data.dbType}. Titles updated.`);
                      window.location.reload();
                    } else {
                      alert("Sync failed: " + (data.error || "Unknown error"));
                    }
                  } catch {
                    alert("Network error triggering sync.");
                  } finally {
                    btn.disabled = false;
                    btn.innerText = "Force Sync Content";
                  }
                }}
                className="btn-outline w-full py-3 text-sm disabled:opacity-50"
              >
                Force Sync Content
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
          <h3 className="text-slate-800 font-bold mb-2">SEO & Sitemap</h3>
          <p className="text-sm text-slate-700 mb-4">
            Your sitemap is automatically generated and updated. You can view it here:
          </p>
          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" target="_blank" className="text-accent font-bold hover:underline text-sm">/sitemap.xml (Technical)</a>
            <Link to="/sitemap" className="text-accent font-bold hover:underline text-sm">/sitemap (Visual)</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
