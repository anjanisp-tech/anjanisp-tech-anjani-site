import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft, Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { adminPost, adminFetch } from '../useAdminApi';
import ImageUpload from '../ImageUpload';
import type { CaseStudy, CaseStudyFormData, StatusMessage } from '../types';

function blank(): CaseStudyFormData {
  return { slug: '', title: '', excerpt: '', img: '', category: '', client: '', period: '', results: [''], content: '' };
}

export default function CaseStudiesTab() {
  const [items, setItems] = useState<CaseStudy[] | null>(null);
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [form, setForm] = useState<CaseStudyFormData>(blank());
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<StatusMessage>({ type: 'idle', message: '' });
  const [busy, setBusy] = useState(false);

  const load = () => {
    adminFetch('/api/admin/casestudies')
      .then(r => r.ok ? r.json() : [])
      .then(setItems)
      .catch(() => setItems([]));
  };
  useEffect(load, []);

  const startNew = () => { setForm(blank()); setIsEditing(false); setStatus({ type: 'idle', message: '' }); setMode('edit'); };
  const startEdit = (c: CaseStudy) => {
    setForm({ ...c, results: c.results?.length ? c.results : [''] });
    setIsEditing(true);
    setStatus({ type: 'idle', message: '' });
    setMode('edit');
  };

  const del = async (slug: string) => {
    if (!confirm(`Delete case study "${slug}"?`)) return;
    await adminFetch(`/api/admin/casestudies/${encodeURIComponent(slug)}`, { method: 'DELETE' });
    setItems(null); load();
  };

  const setResult = (i: number, v: string) => setForm(f => ({ ...f, results: f.results.map((r, idx) => idx === i ? v : r) }));
  const addResult = () => setForm(f => ({ ...f, results: [...f.results, ''] }));
  const removeResult = (i: number) => setForm(f => ({ ...f, results: f.results.filter((_, idx) => idx !== i) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ type: 'idle', message: '' });
    try {
      const payload = { ...form, results: form.results.filter(r => r.trim()) };
      const res = await adminPost('/api/admin/casestudies', payload);
      if (res.ok) {
        setStatus({ type: 'success', message: 'Case study saved.' });
        setItems(null); load();
        setTimeout(() => setMode('list'), 600);
      } else {
        const d = await res.json().catch(() => ({}));
        setStatus({ type: 'error', message: d.error || 'Failed to save.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const labelCls = "text-xs font-bold uppercase tracking-widest text-accent/40 ml-1";
  const inputCls = "w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all";

  if (mode === 'edit') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setMode('list')} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm font-bold text-accent hover:bg-muted/80 transition-all">
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm font-bold text-accent hover:bg-muted/80 transition-all">
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />} {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
          <form onSubmit={submit} className="bg-white border border-border rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold">{isEditing ? 'Edit Case Study' : 'New Case Study'}</h2>
            {status.type !== 'idle' && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-slate-50 text-slate-900' : 'bg-red-50 text-red-700'}`}>
                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="font-bold text-sm">{status.message}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className={labelCls}>Title *</label>
              <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Installing the Operating Spine at..." className={inputCls} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2"><label className={labelCls}>Category</label><input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="AI Operations" className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Client</label><input type="text" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="High-Growth SaaS" className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Period</label><input type="text" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="2026" className={inputCls} /></div>
            </div>

            <div className="space-y-2"><label className={labelCls}>Slug</label><input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from title if blank" className={inputCls} /></div>

            <div className="space-y-2">
              <label className={labelCls}>Excerpt * (shown on the listing)</label>
              <textarea required value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
            </div>

            <ImageUpload label="Cover Image" value={form.img} onChange={url => setForm({ ...form, img: url })} />

            <div className="space-y-3">
              <label className={labelCls}>Key Results</label>
              {form.results.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input type="text" value={r} onChange={e => setResult(i, e.target.value)} placeholder="Cut founder approvals by 70%" className={inputCls} />
                  <button type="button" onClick={() => removeResult(i)} className="text-accent/30 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              ))}
              <button type="button" onClick={addResult} className="flex items-center gap-2 text-sm font-bold text-accent hover:underline"><Plus size={16} /> Add result</button>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Body * (Markdown supported)</label>
              <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={14} placeholder="The challenge, the approach, what was installed..." className={`${inputCls} font-mono text-sm whitespace-pre-wrap`} />
            </div>

            <button type="submit" disabled={busy} className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-50">
              {busy ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} {isEditing ? 'Update Case Study' : 'Publish Case Study'}
            </button>
          </form>

          {showPreview && (
            <div className="bg-white border border-border rounded-3xl p-8 shadow-sm overflow-y-auto max-h-[800px]">
              {form.img && <img src={form.img} alt="" className="w-full h-48 object-cover rounded-2xl mb-6" />}
              <span className="px-3 py-1 bg-accent/5 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">{form.category || 'Category'}</span>
              <h1 className="text-3xl font-bold mb-2">{form.title || 'Case Study Title'}</h1>
              <div className="text-sm text-accent-light mb-6">{[form.client, form.period].filter(Boolean).join(' · ')}</div>
              {form.results.filter(r => r.trim()).length > 0 && (
                <ul className="mb-6 space-y-2">
                  {form.results.filter(r => r.trim()).map((r, i) => <li key={i} className="flex gap-2 text-sm font-bold"><CheckCircle size={16} className="text-accent shrink-0 mt-0.5" />{r}</li>)}
                </ul>
              )}
              <div className="prose prose-slate max-w-none prose-headings:text-accent prose-a:text-accent">
                <Markdown>{form.content || 'Body preview...'}</Markdown>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Case Studies</h2>
          <button onClick={startNew} className="btn-primary flex items-center gap-2"><Plus size={18} /> New case study</button>
        </div>
        {items === null ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-accent" size={28} /></div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-accent/40">No case studies yet. Create your first one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-accent/40">Title</th>
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-accent/40">Client</th>
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-accent/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.slug} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {c.img ? <img src={c.img} alt="" className="w-12 h-9 object-cover rounded-md border border-border shrink-0" /> : <div className="w-12 h-9 rounded-md bg-muted shrink-0" />}
                        <div>
                          <div className="font-bold">{c.title}</div>
                          <div className="text-[11px] text-accent/40">/case-studies/{c.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-accent-light">{c.client}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(c)} className="p-2 text-accent/40 hover:text-accent hover:bg-accent/5 rounded-lg transition-all" title="Edit"><Pencil size={18} /></button>
                        <button onClick={() => del(c.slug)} className="p-2 text-accent/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
