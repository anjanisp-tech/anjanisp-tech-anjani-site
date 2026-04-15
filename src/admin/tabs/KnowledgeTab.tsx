import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminFetch, adminPost } from '../useAdminApi';
import type { KnowledgeSettings } from '../types';

export default function KnowledgeTab() {
  const [knowledgeSettings, setKnowledgeSettings] = useState<KnowledgeSettings>({
    fileId: '',
    lastSync: '',
    status: 'idle',
    error: ''
  });
  const [diagnostic, setDiagnostic] = useState<any>(null);

  useEffect(() => {
    fetchKnowledgeSettings();
    fetch('/api/diagnostic')
      .then(res => res.json())
      .then(data => setDiagnostic(data))
      .catch(err => console.error("Diagnostic fetch failed", err));
  }, []);

  const fetchKnowledgeSettings = async () => {
    try {
      const res = await adminFetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setKnowledgeSettings(prev => ({
          ...prev,
          fileId: data.GOOGLE_DRIVE_KNOWLEDGE_FILE_ID || ''
        }));
      }
    } catch (err) {
      console.error("Failed to fetch knowledge settings", err);
    }
  };

  const handleSaveKnowledgeFileId = async () => {
    try {
      const res = await adminPost('/api/admin/settings', {
        key: 'GOOGLE_DRIVE_KNOWLEDGE_FILE_ID',
        value: knowledgeSettings.fileId
      });
      if (res.ok) {
        alert("Knowledge File ID saved.");
      }
    } catch {
      alert("Failed to save File ID.");
    }
  };

  const handleSyncKnowledge = async () => {
    setKnowledgeSettings(prev => ({ ...prev, status: 'syncing' }));
    try {
      const res = await adminPost('/api/admin/knowledge/sync');
      if (res.ok) {
        const data = await res.json();
        setKnowledgeSettings(prev => ({ ...prev, status: 'success', lastSync: new Date().toLocaleString() }));
        alert(`Sync successful! Knowledge base is now ${data.knowledge?.length || 0} characters.`);
      } else {
        const data = await res.json();
        setKnowledgeSettings(prev => ({ ...prev, status: 'error', error: data.error || data.details || "Unknown error" }));
        alert("Sync failed: " + (data.error || "Check credentials."));
      }
    } catch (err: any) {
      setKnowledgeSettings(prev => ({ ...prev, status: 'error', error: err.message }));
      alert("Network error during sync.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Chatbot Knowledge Base</h2>
        <p className="text-accent-light mb-8">
          The chatbot's "brain" is synced from a Google Doc or .docx file in your Google Drive.
          Update the file ID below and trigger a sync to refresh the AI's knowledge.
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Google Drive File ID</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={knowledgeSettings.fileId}
                onChange={(e) => setKnowledgeSettings({ ...knowledgeSettings, fileId: e.target.value })}
                placeholder="Enter Google Drive File ID..."
                className="flex-1 px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all font-mono text-sm"
              />
              <button
                onClick={handleSaveKnowledgeFileId}
                className="btn-primary px-8 py-3"
              >
                Save ID
              </button>
            </div>
            <p className="text-[10px] text-accent/40 mt-2 italic">
              Tip: The File ID is the long string in the Google Doc URL (e.g., docs.google.com/document/d/<b>FILE_ID</b>/edit)
            </p>
          </div>

          <div className="pt-8 border-t border-border">
            <div className="mb-8 p-4 bg-muted/30 rounded-2xl border border-border">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent/40 mb-3">Backend Credentials Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-accent-light">Service Account Email:</span>
                  <span className={`font-mono font-bold ${diagnostic?.env?.HAS_GOOGLE_EMAIL ? 'text-green-600' : 'text-red-600'}`}>
                    {diagnostic?.env?.HAS_GOOGLE_EMAIL ? (diagnostic.env.USING_ALT_NAMES ? 'PRESENT (via EMAIL)' : 'PRESENT') : 'MISSING'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-accent-light">Private Key:</span>
                  <span className={`font-mono font-bold ${diagnostic?.env?.HAS_GOOGLE_KEY ? 'text-green-600' : 'text-red-600'}`}>
                    {diagnostic?.env?.HAS_GOOGLE_KEY ? (diagnostic.env.USING_ALT_NAMES ? 'PRESENT (via KEY)' : 'PRESENT') : 'MISSING'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold">Sync Status</h3>
                <p className="text-xs text-accent-light">Last synced: {knowledgeSettings.lastSync || 'Never'}</p>
              </div>
              <button
                onClick={handleSyncKnowledge}
                disabled={knowledgeSettings.status === 'syncing'}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  knowledgeSettings.status === 'syncing'
                    ? 'bg-muted text-accent/40 cursor-not-allowed'
                    : 'bg-accent text-white hover:bg-accent-light shadow-lg'
                }`}
              >
                <RefreshCw size={18} className={knowledgeSettings.status === 'syncing' ? 'animate-spin' : ''} />
                {knowledgeSettings.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>

            <div className="p-4 bg-muted/30 rounded-2xl border border-border">
              <div className="flex items-center gap-3 text-sm">
                <div className={`w-3 h-3 rounded-full ${
                  knowledgeSettings.status === 'success' ? 'bg-green-500' :
                  knowledgeSettings.status === 'error' ? 'bg-red-500' : 'bg-slate-300'
                }`} />
                <span className="font-medium">
                  {knowledgeSettings.status === 'syncing' ? 'Sync in progress...' :
                   knowledgeSettings.status === 'success' ? 'Knowledge base is up to date.' :
                   knowledgeSettings.status === 'error' ? `Last sync failed: ${knowledgeSettings.error || 'Check credentials.'}` : 'Ready to sync.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-accent text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -skew-x-12 translate-x-1/2 -translate-y-1/2" />
        <h3 className="text-xl font-bold mb-4 relative z-10">Pro Tip: Content Velocity</h3>
        <p className="text-white/70 text-sm leading-relaxed relative z-10">
          To keep the AI updated with your latest thinking, simply add your new insights, case studies, or frameworks to your master Google Doc.
          Once updated, click "Sync Now" above, and the chatbot will immediately start using that information in its conversations.
        </p>
      </div>
    </div>
  );
}
