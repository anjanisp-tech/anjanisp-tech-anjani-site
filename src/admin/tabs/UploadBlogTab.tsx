import { useState, useEffect } from 'react';
import { FileText, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { adminPost } from '../useAdminApi';
import type { BlogFormData, StatusMessage } from '../types';

interface Props {
  /** Pre-populated form data when editing an existing post */
  editData?: BlogFormData | null;
  /** Callback after clearing edit state */
  onEditComplete?: () => void;
}

function defaultFormData(): BlogFormData {
  return {
    title: '',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
    category: 'Scaling',
    excerpt: '',
    content: '',
    is_premium: false,
  };
}

export default function UploadBlogTab({ editData, onEditComplete }: Props) {
  const [blogForm, setBlogForm] = useState<BlogFormData>(editData || defaultFormData());
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<StatusMessage>({ type: 'idle', message: '' });

  // Re-initialize form when editData changes (e.g. user clicks Edit from Manage tab)
  useEffect(() => {
    if (editData) {
      setBlogForm(editData);
    }
  }, [editData]);

  const isEditing = !!editData;

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await adminPost('/api/admin/posts', blogForm);

      if (res.ok) {
        setStatus({ type: 'success', message: 'Blog post uploaded successfully!' });
        setBlogForm(defaultFormData());
        onEditComplete?.();
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to upload blog post.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm font-bold text-accent hover:bg-muted/80 transition-all"
        >
          {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
        <form onSubmit={handleBlogSubmit} className="bg-white border border-border rounded-3xl p-8 shadow-sm space-y-6">
          {status.type !== 'idle' && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-slate-50 text-slate-900' : 'bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-bold text-sm">{status.message}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Blog Title *</label>
              <input
                type="text"
                required
                value={blogForm.title}
                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                placeholder="e.g. The Scaling Framework"
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Date *</label>
              <input
                type="text"
                required
                value={blogForm.date}
                onChange={(e) => setBlogForm({ ...blogForm, date: e.target.value })}
                placeholder="DD-MMM-YYYY"
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Category *</label>
            <select
              required
              value={blogForm.category}
              onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all appearance-none bg-white"
            >
              <option value="Scaling">Scaling</option>
              <option value="Operations">Operations</option>
              <option value="Leadership">Leadership</option>
              <option value="Strategy">Strategy</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl border border-accent/10">
            <input
              type="checkbox"
              id="is_premium"
              checked={blogForm.is_premium}
              onChange={(e) => setBlogForm({ ...blogForm, is_premium: e.target.checked })}
              className="w-5 h-5 rounded border-accent/20 text-accent focus:ring-accent"
            />
            <label htmlFor="is_premium" className="text-sm font-bold text-accent cursor-pointer">
              Premium Content (Gate behind lead capture)
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Excerpt * (Short summary)</label>
            <textarea
              required
              value={blogForm.excerpt}
              onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
              placeholder="A brief summary of the article..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Full Blog Content * (Markdown supported)</label>
            <textarea
              required
              value={blogForm.content}
              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
              placeholder="Write your article content here..."
              rows={15}
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none font-mono text-sm whitespace-pre-wrap"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-4 flex items-center justify-center gap-3"
          >
            <FileText size={20} /> {isEditing ? 'Update Blog Post' : 'Publish Blog Post'}
          </button>
        </form>

        {showPreview && (
          <div className="bg-white border border-border rounded-3xl p-8 shadow-sm overflow-y-auto max-h-[800px]">
            <div className="mb-8">
              <span className="px-3 py-1 bg-accent/5 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">
                {blogForm.category}
              </span>
              <h1 className="text-3xl font-bold mb-4">{blogForm.title || 'Post Title Preview'}</h1>
              <div className="text-sm text-accent-light mb-8">{blogForm.date}</div>
              <div className="p-4 bg-muted rounded-xl italic text-accent-light mb-8 border-l-4 border-accent">
                {blogForm.excerpt || 'Excerpt preview...'}
              </div>
            </div>
            <div className="prose prose-slate max-w-none prose-headings:text-accent prose-a:text-accent">
              <Markdown>{blogForm.content || 'Content preview...'}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
