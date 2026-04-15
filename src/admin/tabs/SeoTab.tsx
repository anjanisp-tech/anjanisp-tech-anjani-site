import { useState, useEffect } from 'react';
import { Globe, FileText, RefreshCw, CheckCircle } from 'lucide-react';
import { adminFetch, adminPost } from '../useAdminApi';

export default function SeoTab() {
  const [seoInstructions, setSeoInstructions] = useState<any[]>([]);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [seoFolderId, setSeoFolderId] = useState('');

  useEffect(() => {
    fetchSeoInstructions();
    fetchSeoSettings();
  }, []);

  const fetchSeoInstructions = async () => {
    setIsSeoLoading(true);
    try {
      const res = await adminFetch('/api/admin/seo/pending');

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          setSeoInstructions(data.instructions || []);
        } else {
          console.error("SEO Error:", data.error, data.details, data.stack);
          const errorMsg = "SEO Error: " + (data.error || "Failed to fetch instructions") +
                          "\n\nDetails: " + (data.details || "No details provided") +
                          (data.stack ? "\n\nStack: " + data.stack.substring(0, 200) + "..." : "");
          alert(errorMsg);
          setSeoInstructions([]);
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        alert("Server returned non-JSON response. \n\nStatus: " + res.status + "\n\nBody: " + text.substring(0, 300));
        setSeoInstructions([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch SEO instructions", err);
      alert("Network Error: " + err.message);
    } finally {
      setIsSeoLoading(false);
    }
  };

  const fetchSeoSettings = async () => {
    try {
      const res = await adminFetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSeoFolderId(data.GOOGLE_DRIVE_SEO_FOLDER_ID || '');
      }
    } catch (err) {
      console.error("Failed to fetch SEO settings", err);
    }
  };

  const handleSaveSeoFolderId = async () => {
    try {
      const res = await adminPost('/api/admin/settings', {
        key: 'GOOGLE_DRIVE_SEO_FOLDER_ID',
        value: seoFolderId
      });
      if (res.ok) {
        alert("SEO Folder ID saved.");
      }
    } catch {
      alert("Failed to save SEO Folder ID.");
    }
  };

  const handleExecuteSeo = async (instructionId: string) => {
    if (!confirm("Are you sure you want to execute this SEO instruction? This will modify your website code.")) return;
    try {
      const res = await adminPost('/api/admin/seo/execute', { instructionId });
      const data = await res.json();
      if (res.ok) {
        alert("SEO execution successful: " + data.message);
        fetchSeoInstructions();
      } else {
        alert("SEO execution failed: " + (data.error || data.details));
      }
    } catch (err: any) {
      alert("Network error during SEO execution: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* SEO Settings */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Globe className="text-accent" size={24} /> SEO Pipeline Configuration
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label className="text-[10px] font-bold uppercase tracking-widest text-accent/40 mb-2 block">Google Drive SEO Folder ID</label>
            <input
              type="text"
              value={seoFolderId}
              onChange={(e) => setSeoFolderId(e.target.value)}
              placeholder="Enter Folder ID from Google Drive"
              className="w-full px-6 py-4 rounded-xl bg-muted border border-border outline-none focus:border-accent transition-all text-sm font-mono"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSaveSeoFolderId}
              className="btn-primary py-4 px-8"
            >
              Save Configuration
            </button>
          </div>
        </div>
        <p className="text-xs text-accent-light/50 mt-4 italic">
          Drop JSON instruction files into the <code className="bg-muted px-1 rounded">01_PENDING</code> subfolder within this Drive folder.
        </p>
      </div>

      {/* Pending Instructions */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <FileText className="text-accent" size={24} /> Pending SEO Instructions
          </h3>
          <button
            onClick={fetchSeoInstructions}
            disabled={isSeoLoading}
            className="p-2 text-accent/40 hover:text-accent transition-colors"
            title="Refresh Instructions"
          >
            <RefreshCw className={isSeoLoading ? 'animate-spin' : ''} size={20} />
          </button>
        </div>

        {isSeoLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-accent/20">
            <RefreshCw className="animate-spin mb-4" size={48} />
            <p className="font-bold animate-pulse">Scanning Google Drive...</p>
          </div>
        ) : seoInstructions.length > 0 ? (
          <div className="space-y-4">
            {seoInstructions.map((instruction) => (
              <div key={instruction.id} className="p-6 bg-muted/30 rounded-2xl border border-border/50 hover:border-accent/30 transition-all group">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-1 bg-accent/10 text-accent rounded uppercase tracking-widest">
                        {instruction.content.action}
                      </span>
                      <h4 className="font-bold text-lg">{instruction.name}</h4>
                    </div>
                    <div className="text-sm text-accent-light/70">
                      Target: <code className="bg-white px-1 rounded border border-border/50">{instruction.content.target || 'Global'}</code>
                    </div>
                    <div className="mt-4 p-4 bg-white rounded-xl border border-border/30 text-[11px] font-mono overflow-x-auto">
                      <pre>{JSON.stringify(instruction.content.payload, null, 2)}</pre>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <button
                      onClick={() => handleExecuteSeo(instruction.id)}
                      className="btn-primary py-3 px-6 text-sm flex items-center gap-2 w-full md:w-auto"
                    >
                      <CheckCircle size={18} /> Execute Action
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-accent/10">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-accent/30 mb-2">No pending instructions found.</h3>
            <p className="text-sm text-accent-light/40 max-w-xs mx-auto">
              Drop a JSON file into your Drive folder's <code className="bg-muted px-1 rounded">01_PENDING</code> directory to see it here.
            </p>
          </div>
        )}
      </div>

      {/* Documentation Link */}
      <div className="bg-muted/50 p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="font-bold mb-1">Need the JSON Format?</h4>
          <p className="text-sm text-accent-light/60">View the full specification for all supported SEO actions and their required payloads.</p>
        </div>
        <button
          onClick={() => window.open('/SEO_PIPELINE_SPEC.md', '_blank')}
          className="btn-outline py-3 px-8 text-sm whitespace-nowrap"
        >
          View SEO Spec
        </button>
      </div>
    </div>
  );
}
