import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Reply, Send, FileText, PlusCircle, CheckCircle, AlertCircle, Mail, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Comment {
  id: number;
  post_id: string;
  post_title: string;
  name: string;
  email: string;
  comment: string;
  phone?: string;
  is_admin: number;
  created_at: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'upload' | 'subscribers' | 'system'>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<{ id: number, email: string, created_at: string }[]>([]);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [blogForm, setBlogForm] = useState({
    title: '',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
    category: 'Scaling',
    excerpt: '',
    content: ''
  });
  
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const secret = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin123';
      if (password === secret) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_pwd', password);
      } else {
        alert("Incorrect password");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (password === 'admin123') {
        setIsAuthenticated(true);
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_pwd', password);
      } else {
        alert("Incorrect password or system error.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_pwd');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error("Caught global error:", e);
      // Only alert in development or if it's a critical error
      if ((import.meta as any).env.MODE !== 'production') {
        alert("Admin Dashboard Error: " + e.message);
      }
    };
    window.addEventListener('error', handleError);
    
    if (activeTab === 'comments' && isAuthenticated) {
      fetchComments();
    }
    if (activeTab === 'subscribers' && isAuthenticated) {
      fetchSubscribers();
    }
    
    if (activeTab === 'system' && isAuthenticated) {
      fetch('/api/health').then(res => res.json()).then(data => {
        const resendEl = document.getElementById('resend-status');
        const dbEl = document.getElementById('db-status');
        const envEl = document.getElementById('env-debug');
        
        if (resendEl) {
          resendEl.innerText = data.resendConfigured ? 'Configured' : 'Missing or Invalid API Key';
          resendEl.className = `px-2 py-0.5 rounded ${data.resendConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`;
        }
        if (dbEl) {
          dbEl.innerText = data.dbType + (data.postgresConfigured ? ' (Postgres)' : ' (Local SQLite)');
          dbEl.className = `px-2 py-0.5 rounded ${data.postgresConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`;
        }
        if (envEl && data.envCheck) {
          envEl.innerHTML = `
            <div class="mt-4 p-3 bg-black/5 rounded text-[10px] font-mono space-y-1">
              <div class="flex justify-between"><span>RESEND_KEY:</span> <span>${data.envCheck.hasResendKey ? 'PRESENT (' + data.envCheck.resendKeyLength + ' chars)' : 'MISSING'}</span></div>
              <div class="flex justify-between"><span>FROM_EMAIL:</span> <span>${data.envCheck.fromEmail}</span></div>
              <div class="flex justify-between"><span>DB_TYPE:</span> <span>${data.dbType}</span></div>
              <div class="flex justify-between"><span>LAST_SYNC:</span> <span>${new Date(data.initializedAt).toLocaleTimeString()}</span></div>
              <div class="mt-2 pt-2 border-t border-black/10">
                <div class="mb-1 opacity-50">Detected Keys:</div>
                <div class="flex flex-wrap gap-1">
                  ${data.envCheck.allKeys.map((k: string) => `<span class="bg-black/10 px-1 rounded">${k}</span>`).join('')}
                </div>
              </div>
            </div>
          `;
        }
      }).catch(() => {});
    }
    
    return () => window.removeEventListener('error', handleError);
  }, [activeTab, isAuthenticated]);

  const fetchComments = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      // Fetch debug info too
      fetch('/api/debug').then(res => res.json()).then(data => {
        if (data.status === 'ok') {
          const typeEl = document.getElementById('db-type');
          const initEl = document.getElementById('db-init-time');
          const postEl = document.getElementById('db-post-count');
          const commEl = document.getElementById('db-comment-count');
          if (typeEl) typeEl.innerText = data.dbType;
          if (initEl) initEl.innerText = new Date(data.initializedAt).toLocaleString();
          if (postEl) postEl.innerText = data.counts.posts.count;
          if (commEl) commEl.innerText = data.counts.comments.count;
        }
      }).catch(() => {});

      const res = await fetch('/api/admin/comments', {
        headers: { 'x-admin-password': secret }
      });
      
      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        console.error("Expected array of comments, got:", data);
        setComments([]);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
      setComments([]);
    }
  };

  const fetchSubscribers = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/subscriptions', {
        headers: { 'x-admin-password': secret }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      console.error("Failed to fetch subscribers", err);
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { 
        method: 'DELETE',
        headers: { 'x-admin-password': secret }
      });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleReply = async (comment: Comment) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/blog/${comment.post_id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Anjani Pandey (Admin)',
          email: 'contact@anjanipandey.com',
          comment: replyText,
          parent_id: comment.id,
          is_admin: true
        })
      });
      if (res.ok) {
        setReplyTo(null);
        setReplyText('');
        fetchComments();
        alert("Reply posted!");
      }
    } catch (err) {
      console.error("Failed to post reply", err);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'idle', message: '' });
    const secret = password || localStorage.getItem('admin_pwd') || '';
    
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': secret
        },
        body: JSON.stringify(blogForm)
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Blog post uploaded successfully!' });
        setBlogForm({
          title: '',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
          category: 'Scaling',
          excerpt: '',
          content: ''
        });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to upload blog post.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="bg-white p-8 rounded-3xl border border-border shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent text-white flex items-center justify-center rounded-2xl mx-auto mb-4 font-bold text-2xl shadow-lg">AP</div>
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-accent-light text-sm">Please enter your password to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all"
              autoFocus
              autoComplete="current-password"
            />
            <button type="submit" className="w-full btn-primary py-3">Login</button>
          </form>
          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-accent/40 hover:text-accent">Back to Website</a>
          </div>
        </div>
      </div>
    );
  }

  // Defensive rendering to prevent blank screen
  try {
    return (
      <div className="bg-white min-h-screen pt-32 pb-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-accent-light">Manage your blog content and discussions.</p>
            </div>
            
            <div className="flex bg-muted p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'comments' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <MessageSquare size={18} /> Comments
              </button>
              <button 
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upload' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <PlusCircle size={18} /> Upload Blog
              </button>
              <button 
                onClick={() => setActiveTab('subscribers')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'subscribers' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <Mail size={18} /> Subscribers
              </button>
              <button 
                onClick={() => setActiveTab('system')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <Rocket size={18} /> System
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-red-400 hover:text-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>

          {activeTab === 'comments' ? (
            <div className="space-y-6">
              {/* System Status Info */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-wrap gap-6 text-xs text-blue-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  <span className="font-bold uppercase tracking-wider">Storage:</span>
                  <span id="db-type">Loading...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider">DB Initialized:</span>
                  <span id="db-init-time">Loading...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider">Posts:</span>
                  <span id="db-post-count">...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider">Comments:</span>
                  <span id="db-comment-count">...</span>
                </div>
                <div className="w-full mt-2 pt-2 border-t border-blue-100 italic opacity-80">
                  Note: If Storage shows "SQLite", data is ephemeral. Connect Vercel Postgres for permanent storage.
                </div>
              </div>

              {Array.isArray(comments) && comments.length > 0 ? (
                comments.filter(c => !c.is_admin).map((c) => (
                  <div key={c.id} className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg">{c?.name || 'Anonymous'}</span>
                          <span className="text-xs font-bold uppercase tracking-widest text-accent/30">on {c?.post_title || 'Unknown Post'}</span>
                        </div>
                        <div className="text-xs text-accent-light flex gap-4">
                          <span>{c?.email || 'No Email'}</span>
                          {c?.phone && <span>{c.phone}</span>}
                          <span>{c?.created_at ? new Date(c.created_at).toLocaleString() : 'Date Unknown'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                          className="p-2 text-accent/40 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                          title="Reply"
                        >
                          <Reply size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-2 text-accent/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-accent-light bg-muted/30 p-4 rounded-xl mb-4 italic">"{c.comment}"</p>
                    
                    {replyTo === c.id && (
                      <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply as Admin..."
                          className="w-full p-4 rounded-xl border border-accent/20 focus:border-accent outline-none text-sm resize-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setReplyTo(null)} className="text-xs font-bold text-accent/40 hover:text-accent">Cancel</button>
                          <button 
                            onClick={() => handleReply(c)}
                            className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-accent-light transition-colors"
                          >
                            <Send size={14} /> Post Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl">
                  <MessageSquare className="mx-auto text-accent/10 mb-4" size={48} />
                  <p className="text-accent/40 font-medium">No comments to manage yet.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'upload' ? (
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleBlogSubmit} className="bg-white border border-border rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
                {status.type !== 'idle' && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{status.message}</span>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Blog Title *</label>
                    <input 
                      type="text" 
                      required
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
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
                      onChange={(e) => setBlogForm({...blogForm, date: e.target.value})}
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
                    onChange={(e) => setBlogForm({...blogForm, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="Scaling">Scaling</option>
                    <option value="Operations">Operations</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Excerpt * (Short summary)</label>
                  <textarea 
                    required
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({...blogForm, excerpt: e.target.value})}
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
                    onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                    placeholder="Write your article content here..."
                    rows={15}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all font-mono text-sm"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full btn-primary py-4 flex items-center justify-center gap-3"
                >
                  <FileText size={20} /> Publish Blog Post
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
                <button 
                  onClick={() => {
                    const csv = subscribers.map(s => s.email).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'subscribers.csv');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
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
          )}
          
          {activeTab === 'system' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">System Controls</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Mail className="text-accent" size={20} /> Email Notifications
                    </h3>
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="font-bold uppercase tracking-wider">Status:</span>
                      <span id="resend-status" className="px-2 py-0.5 rounded bg-muted text-accent/60">Checking...</span>
                    </div>
                    <p className="text-sm text-accent-light">
                      Verify your Resend configuration by sending a test email to <strong>contact@anjanipandey.com</strong>.
                    </p>
                    <div id="env-debug"></div>
                    <button 
                      id="test-email-btn"
                      onClick={async (e) => {
                        const btn = e.currentTarget;
                        btn.disabled = true;
                        btn.innerText = "Sending...";
                        const secret = password || localStorage.getItem('admin_pwd') || '';
                        try {
                          const res = await fetch('/api/admin/test-email', {
                            method: 'POST',
                            headers: { 'x-admin-password': secret }
                          });
                          const data = await res.json();
                          if (res.ok) alert("Success: " + data.message);
                          else {
                            let msg = data.error || "Unknown error";
                            if (data.details) msg += "\n\nDetails: " + data.details;
                            alert("Error: " + msg);
                          }
                        } catch (err) {
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
                  </div>

                  <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <FileText className="text-accent" size={20} /> Content Sync
                    </h3>
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="font-bold uppercase tracking-wider">Database:</span>
                      <span id="db-status" className="px-2 py-0.5 rounded bg-muted text-accent/60">Checking...</span>
                    </div>
                    <p className="text-sm text-accent-light">
                      Force update blog titles and structure across the database to match the latest system standards.
                    </p>
                    <button 
                      id="sync-btn"
                      onClick={async (e) => {
                        const btn = e.currentTarget;
                        btn.disabled = true;
                        btn.innerText = "Syncing...";
                        const secret = password || localStorage.getItem('admin_pwd') || '';
                        try {
                          const res = await fetch('/api/health?force=true', {
                            headers: { 'x-admin-password': secret }
                          });
                          const data = await res.json();
                          if (res.ok) {
                            alert(`Sync complete! DB: ${data.dbType}. Titles updated.`);
                            window.location.reload(); // Refresh to see changes
                          } else {
                            alert("Sync failed: " + (data.error || "Unknown error"));
                          }
                        } catch (err) {
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

                <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                  <h3 className="text-blue-800 font-bold mb-2">SEO & Sitemap</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Your sitemap is automatically generated and updated. You can view it here:
                  </p>
                  <div className="flex items-center gap-4">
                    <a href="/sitemap.xml" target="_blank" className="text-accent font-bold hover:underline text-sm">/sitemap.xml (Technical)</a>
                    <Link to="/sitemap" className="text-accent font-bold hover:underline text-sm">/sitemap (Visual)</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-100 max-w-2xl w-full shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle /> Dashboard Error
          </h2>
          <p className="mb-6">The admin dashboard encountered a rendering error. This might be due to unexpected data from the server.</p>
          <pre className="bg-white/50 p-4 rounded-xl text-xs overflow-auto mb-6 max-h-40">
            {err instanceof Error ? err.message : String(err)}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
          >
            Reset & Try Again
          </button>
        </div>
      </div>
    );
  }
}
