import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Reply, Send, FileText, PlusCircle, CheckCircle, AlertCircle, Mail, Rocket, Eye, EyeOff, RefreshCw, Database, BarChart3, Calculator, Info, Globe, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';

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
  const [activeTab, setActiveTab] = useState<'comments' | 'upload' | 'subscribers' | 'system' | 'manage' | 'knowledge' | 'analytics' | 'ai-debug' | 'seo' | 'all-emails'>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<{ id: number, email: string, created_at: string }[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{ chatbotQueries: any[], blogViews: any[], calculatorLeads: any[], chatbotLeads: any[] }>({ chatbotQueries: [], blogViews: [], calculatorLeads: [], chatbotLeads: [] });
  const [allEmails, setAllEmails] = useState<{ email: string, source: string, created_at: string, metadata: string | null }[]>([]);
  const [emailSourceFilter, setEmailSourceFilter] = useState<string>('all');
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [seoInstructions, setSeoInstructions] = useState<any[]>([]);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [seoFolderId, setSeoFolderId] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [aiDebugQuery, setAiDebugQuery] = useState('');
  const [aiDebugResult, setAiDebugResult] = useState<{ response: string, context: string, status: 'idle' | 'loading' | 'success' | 'error' }>({ response: '', context: '', status: 'idle' });
  
  const [blogForm, setBlogForm] = useState({
    title: '',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
    category: 'Scaling',
    excerpt: '',
    content: '',
    is_premium: false
  });

  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [knowledgeSettings, setKnowledgeSettings] = useState({
    fileId: '',
    lastSync: '',
    status: 'idle' as 'idle' | 'syncing' | 'success' | 'error',
    error: ''
  });
  
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const testRes = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${password}` }
      });
      if (testRes.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_pwd', password);
      } else {
        alert("Incorrect password");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Check your connection.");
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
    
    if (activeTab === 'manage' && isAuthenticated) {
      fetchBlogs();
    }

    if (activeTab === 'knowledge' && isAuthenticated) {
      fetchKnowledgeSettings();
    }

    if (activeTab === 'system' && isAuthenticated) {
      fetchAudits();
    }

    if (activeTab === 'analytics' && isAuthenticated) {
      fetchAnalytics();
    }

    if (activeTab === 'seo' && isAuthenticated) {
      fetchSeoInstructions();
      fetchSeoSettings();
    }

    if (activeTab === 'all-emails' && isAuthenticated) {
      fetchAllEmails();
    }
    
    if ((activeTab === 'system' || activeTab === 'knowledge' || activeTab === 'seo') && isAuthenticated) {
      fetch('/api/diagnostic')
        .then(res => res.json())
        .then(data => {
          setDiagnostic(data);
        })
        .catch(err => console.error("Diagnostic fetch failed", err));
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
        headers: { 'Authorization': `Bearer ${secret}` }
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

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post? This will also delete all associated comments.")) return;
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      if (res.ok) {
        setBlogs(blogs.filter(b => b.id !== id));
        alert("Blog post deleted.");
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || "Failed to delete blog"));
      }
    } catch (err) {
      console.error("Failed to delete blog", err);
    }
  };

  const handleEditBlog = (post: any) => {
    setBlogForm({
      title: post.title,
      date: post.date,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      is_premium: !!post.is_premium
    });
    setActiveTab('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchKnowledgeSettings = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
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
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secret}`
        },
        body: JSON.stringify({ 
          key: 'GOOGLE_DRIVE_KNOWLEDGE_FILE_ID', 
          value: knowledgeSettings.fileId 
        })
      });
      if (res.ok) {
        alert("Knowledge File ID saved.");
      }
    } catch (err) {
      alert("Failed to save File ID.");
    }
  };

  const handleSyncKnowledge = async () => {
    setKnowledgeSettings(prev => ({ ...prev, status: 'syncing' }));
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/knowledge/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${secret}` }
      });
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

  const handleInitDb = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/init-db', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Database initialized successfully.");
      } else {
        const data = await res.json();
        alert("Initialization failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Network error during initialization.");
    }
  };

  const handleDownloadArchitecture = () => {
    window.open('/ARCHITECTURE.md', '_blank');
  };

  const fetchAudits = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/audits', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAudits(data);
      }
    } catch (err) {
      console.error("Failed to fetch audits:", err);
    }
  };

  const fetchSeoInstructions = async () => {
    setIsSeoLoading(true);
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/seo/pending', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      
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
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSeoFolderId(data.GOOGLE_DRIVE_SEO_FOLDER_ID || '');
      }
    } catch (err) {
      console.error("Failed to fetch SEO settings", err);
    }
  };

  const handleSaveSeoFolderId = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secret}`
        },
        body: JSON.stringify({ 
          key: 'GOOGLE_DRIVE_SEO_FOLDER_ID', 
          value: seoFolderId 
        })
      });
      if (res.ok) {
        alert("SEO Folder ID saved.");
      }
    } catch (err) {
      alert("Failed to save SEO Folder ID.");
    }
  };

  const handleExecuteSeo = async (instructionId: string) => {
    if (!confirm("Are you sure you want to execute this SEO instruction? This will modify your website code.")) return;
    const secret = password || localStorage.getItem('admin_pwd') || '';
    setStatus({ type: 'idle', message: 'Executing SEO instruction...' });
    try {
      const res = await fetch('/api/admin/seo/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secret}`
        },
        body: JSON.stringify({ instructionId })
      });
      const data = await res.json();
      if (res.ok) {
        alert("SEO execution successful: " + data.message);
        fetchSeoInstructions();
      } else {
        alert("SEO execution failed: " + (data.error || data.details));
      }
    } catch (err: any) {
      alert("Network error during SEO execution: " + err.message);
    } finally {
      setStatus({ type: 'idle', message: '' });
    }
  };

  const fetchAnalytics = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleRunAudit = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    setIsAuditing(true);
    try {
      const res = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      const data = await res.json().catch(() => ({ error: "Unknown error" }));
      if (res.ok) {
        fetchAudits();
      } else {
        alert(`Audit failed: ${data.error || "Unknown error"}${data.details ? ` (${data.details})` : ""}`);
      }
    } catch (err) {
      alert("Network error during audit.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAiDebug = async () => {
    if (!aiDebugQuery.trim()) return;
    const secret = password || localStorage.getItem('admin_pwd') || '';
    setAiDebugResult({ ...aiDebugResult, status: 'loading' });
    try {
      const res = await fetch('/api/admin/ai-debug', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secret}`
        },
        body: JSON.stringify({ message: aiDebugQuery })
      });
      const data = await res.json();
      if (res.ok) {
        setAiDebugResult({
          response: data.response,
          context: data.context,
          status: 'success'
        });
      } else {
        setAiDebugResult({
          response: `Error: ${data.error || "Unknown error"}`,
          context: '',
          status: 'error'
        });
      }
    } catch (err) {
      setAiDebugResult({
        response: "Network error during AI debug.",
        context: '',
        status: 'error'
      });
    }
  };

  const fetchSubscribers = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch('/api/admin/subscriptions', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      console.error("Failed to fetch subscribers", err);
    }
  };

  const fetchAllEmails = async () => {
    const secret = password || localStorage.getItem('admin_pwd') || '';
    setIsLoadingEmails(true);
    try {
      const res = await fetch('/api/admin/all-emails', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllEmails(data);
      }
    } catch (err) {
      console.error("Failed to fetch all emails", err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const secret = password || localStorage.getItem('admin_pwd') || '';
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${secret}` }
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
          'Authorization': `Bearer ${secret}`
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
          content: '',
          is_premium: false
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
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'manage' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <FileText size={18} /> Manage Blogs
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'subscribers' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <Mail size={18} /> Subscribers
              </button>
              <button
                onClick={() => setActiveTab('all-emails')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all-emails' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <Users size={18} /> All Emails
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'knowledge' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <Database size={18} /> Knowledge
              </button>
              <button 
                onClick={() => setActiveTab('system')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <Rocket size={18} /> System
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <BarChart3 size={18} /> Analytics
              </button>
              <button 
                onClick={() => setActiveTab('seo')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'seo' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <Globe size={18} /> SEO Pipeline
              </button>
              <button 
                onClick={() => setActiveTab('ai-debug')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ai-debug' ? 'bg-white shadow-sm text-accent' : 'text-accent/40 hover:text-accent/60'}`}
              >
                <MessageSquare size={18} /> AI Debug
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
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-wrap gap-6 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
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
                <div className="w-full mt-2 pt-2 border-t border-slate-100 italic opacity-80">
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
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{blogs.some(b => b.title === blogForm.title) ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
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

                  <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl border border-accent/10">
                    <input 
                      type="checkbox" 
                      id="is_premium"
                      checked={blogForm.is_premium}
                      onChange={(e) => setBlogForm({...blogForm, is_premium: e.target.checked})}
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
                      className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none font-mono text-sm whitespace-pre-wrap"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full btn-primary py-4 flex items-center justify-center gap-3"
                  >
                    <FileText size={20} /> {blogs.some(b => b.title === blogForm.title) ? 'Update Blog Post' : 'Publish Blog Post'}
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
          ) : activeTab === 'manage' ? (
            <div className="space-y-6">
              <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-8">Manage Blog Posts</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-4 text-xs font-bold uppercase tracking-widest text-accent/40">Title</th>
                        <th className="py-4 text-xs font-bold uppercase tracking-widest text-accent/40">Category</th>
                        <th className="py-4 text-xs font-bold uppercase tracking-widest text-accent/40">Date</th>
                        <th className="py-4 text-xs font-bold uppercase tracking-widest text-accent/40 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map((post) => (
                        <tr key={post.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-4 font-bold">{post.title}</td>
                          <td className="py-4 text-sm">
                            <span className="px-2 py-1 bg-accent/5 text-accent rounded text-[10px] font-bold uppercase tracking-wider">
                              {post.category}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-accent-light">{post.date}</td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleEditBlog(post)}
                                className="p-2 text-accent/40 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Reply className="rotate-180" size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteBlog(post.id)}
                                className="p-2 text-accent/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {blogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-accent/40">No blog posts found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'knowledge' ? (
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
                        onChange={(e) => setKnowledgeSettings({...knowledgeSettings, fileId: e.target.value})}
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
          ) : activeTab === 'subscribers' ? (
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
          ) : activeTab === 'all-emails' ? (
            <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold">All Emails</h2>
                  <p className="text-sm text-accent-light mt-1">
                    Unified view across all {(() => {
                      const uniqueEmails = new Set(allEmails.map(e => e.email.toLowerCase()));
                      return uniqueEmails.size;
                    })()} unique emails from {allEmails.length} records
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={emailSourceFilter}
                    onChange={(e) => setEmailSourceFilter(e.target.value)}
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
                    onClick={() => {
                      const seen = new Set<string>();
                      const deduped = allEmails
                        .filter(e => emailSourceFilter === 'all' || e.source === emailSourceFilter)
                        .filter(e => {
                          const key = e.email.toLowerCase();
                          if (seen.has(key)) return false;
                          seen.add(key);
                          return true;
                        });
                      const csv = ['Email,Source,Date,Metadata']
                        .concat(deduped.map(e => `${e.email},${e.source},${e.created_at},${(e.metadata || '').replace(/,/g, ';')}`))
                        .join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.setAttribute('hidden', '');
                      a.setAttribute('href', url);
                      a.setAttribute('download', `all-emails-${emailSourceFilter}.csv`);
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="text-sm font-bold text-accent hover:underline"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={fetchAllEmails}
                    className="p-2 text-accent/40 hover:text-accent transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={isLoadingEmails ? 'animate-spin' : ''} size={18} />
                  </button>
                </div>
              </div>

              {/* Source breakdown chips */}
              <div className="flex flex-wrap gap-3 mb-6">
                {['newsletter', 'chatbot', 'resource', 'comment', 'calculator'].map(source => {
                  const count = allEmails.filter(e => e.source === source).length;
                  const uniqueCount = new Set(allEmails.filter(e => e.source === source).map(e => e.email.toLowerCase())).size;
                  if (count === 0) return null;
                  return (
                    <button
                      key={source}
                      onClick={() => setEmailSourceFilter(emailSourceFilter === source ? 'all' : source)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        emailSourceFilter === source
                          ? 'bg-accent text-white border-accent'
                          : 'bg-muted/30 text-accent/60 border-border hover:border-accent/30'
                      }`}
                    >
                      {source.charAt(0).toUpperCase() + source.slice(1)}: {uniqueCount} unique / {count} total
                    </button>
                  );
                })}
              </div>

              {isLoadingEmails ? (
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
                        const filtered = allEmails.filter(e => emailSourceFilter === 'all' || e.source === emailSourceFilter);
                        const seen = new Set<string>();
                        return filtered.map((entry, idx) => {
                          const emailLower = entry.email.toLowerCase();
                          const isDuplicate = seen.has(emailLower);
                          seen.add(emailLower);
                          const sourceColors: Record<string, string> = {
                            newsletter: 'bg-blue-50 text-blue-700 border-blue-200',
                            chatbot: 'bg-purple-50 text-purple-700 border-purple-200',
                            resource: 'bg-green-50 text-green-700 border-green-200',
                            comment: 'bg-orange-50 text-orange-700 border-orange-200',
                            calculator: 'bg-red-50 text-red-700 border-red-200',
                          };
                          return (
                            <tr key={idx} className={`hover:bg-muted/30 transition-colors ${isDuplicate ? 'opacity-40' : ''}`}>
                              <td className="py-4">
                                <div className="font-medium text-sm">{entry.email}</div>
                                {isDuplicate && <span className="text-[10px] text-accent/30 font-bold">DUPLICATE</span>}
                              </td>
                              <td className="py-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${sourceColors[entry.source] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                  {entry.source}
                                </span>
                              </td>
                              <td className="py-4 text-xs font-mono text-accent-light">{new Date(entry.created_at).toLocaleString()}</td>
                              <td className="py-4 text-xs text-accent-light max-w-xs truncate">{entry.metadata || <span className="opacity-30 italic">-</span>}</td>
                            </tr>
                          );
                        });
                      })()}
                      {allEmails.filter(e => emailSourceFilter === 'all' || e.source === emailSourceFilter).length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-accent/40">No emails collected yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'system' ? (
            <div className="space-y-8 max-w-4xl mx-auto">
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

              <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Environment & Credentials</h2>
                <div className="space-y-6">
                  <div id="env-debug"></div>
                  
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
                      Verify your Resend configuration by sending a test email. Note: Free tier accounts can only send to their verified email address.
                    </p>
                    <div id="env-debug"></div>
                    
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
                          onClick={async (e) => {
                            const input = document.getElementById('manual-resend-key') as HTMLInputElement;
                            const key = input.value.trim();
                            if (!key) return alert("Please enter a key");
                            const secret = password || localStorage.getItem('admin_pwd') || '';
                            try {
                              const res = await fetch('/api/admin/save-resend-key', {
                                method: 'POST',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${secret}`
                                },
                                body: JSON.stringify({ key })
                              });
                              const data = await res.json();
                              if (res.ok) {
                                let msg = data.message;
                                if (data.warning) msg += "\n\nWarning: " + data.warning;
                                alert(msg);
                                window.location.reload();
                              } else {
                                alert("Error: " + (data.error || "Unknown error"));
                              }
                            } catch (err) {
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
                          const secret = password || localStorage.getItem('admin_pwd') || '';
                          try {
                            const res = await fetch('/api/admin/test-email', {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${secret}` }
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

                      <button 
                        onClick={async (e) => {
                          if (!confirm("This will kill the server process to force a reload of environment variables. The app will be offline for a few seconds. Continue?")) return;
                          const btn = e.currentTarget;
                          btn.disabled = true;
                          btn.innerText = "Restarting...";
                          const secret = password || localStorage.getItem('admin_pwd') || '';
                          try {
                            const res = await fetch('/api/admin/restart-server', {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${secret}` }
                            });
                            const data = await res.json();
                            alert(data.message);
                            setTimeout(() => window.location.reload(), 3000);
                          } catch (err) {
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
                        const secret = password || localStorage.getItem('admin_pwd') || '';
                        try {
                          const res = await fetch('/api/diagnostic?force=true', {
                            headers: { 'Authorization': `Bearer ${secret}` }
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
          ) : activeTab === 'analytics' ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Blog Views */}
                <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Eye className="text-accent" size={24} /> Popular Articles
                  </h3>
                  {isLoadingAnalytics ? (
                    <div className="py-12 flex justify-center"><RefreshCw className="animate-spin text-accent/20" /></div>
                  ) : analytics.blogViews.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.blogViews.map((view: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                          <div className="flex-grow pr-4">
                            <div className="font-bold text-sm line-clamp-1">{view.title || view.post_id}</div>
                            <div className="text-[10px] text-accent/40 font-mono uppercase tracking-widest">{view.post_id}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-accent">{view.views}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-accent/30">Views</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-accent/30 font-bold italic">No view data yet.</div>
                  )}
                </div>

                {/* Chatbot Queries */}
                <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <MessageSquare className="text-accent" size={24} /> Recent Chat Queries
                  </h3>
                  {isLoadingAnalytics ? (
                    <div className="py-12 flex justify-center"><RefreshCw className="animate-spin text-accent/20" /></div>
                  ) : analytics.chatbotQueries.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {analytics.chatbotQueries.map((query: any, idx: number) => (
                        <div key={idx} className="p-4 bg-muted/30 rounded-2xl space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div className="text-xs font-bold text-accent">Q: {query.query}</div>
                            <div className="text-[10px] text-accent/30 whitespace-nowrap">{new Date(query.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="text-[11px] text-accent-light leading-relaxed bg-white/50 p-3 rounded-xl border border-border/30">
                            <span className="font-bold text-accent/40 mr-1">A:</span> {query.response?.substring(0, 200)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-accent/30 font-bold italic">No chat queries yet.</div>
                  )}
                </div>
              </div>

              {/* Calculator Leads */}
              <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Calculator className="text-accent" size={24} /> Calculator Leads & Results
                </h3>
                {isLoadingAnalytics ? (
                  <div className="py-12 flex justify-center"><RefreshCw className="animate-spin text-accent/20" /></div>
                ) : analytics.calculatorLeads && analytics.calculatorLeads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Date</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Email</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Revenue</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Total Tax</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {analytics.calculatorLeads.map((lead: any, idx: number) => (
                          <tr key={idx} className="hover:bg-muted/30 transition-colors">
                            <td className="py-4 text-xs font-mono">{new Date(lead.created_at).toLocaleDateString()}</td>
                            <td className="py-4 text-sm font-bold">{lead.email || <span className="opacity-20 italic">Anonymous</span>}</td>
                            <td className="py-4 text-sm font-mono">{lead.currency} {lead.revenue.toLocaleString()}</td>
                            <td className="py-4 text-sm font-mono font-bold text-red-600">{lead.currency} {lead.total_tax.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-accent/30 font-bold italic">No calculator data yet.</div>
                )}
              </div>

              {/* Chatbot Leads (Email Captures) */}
              <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Mail className="text-accent" size={24} /> Chatbot Email Leads
                </h3>
                {isLoadingAnalytics ? (
                  <div className="py-12 flex justify-center"><RefreshCw className="animate-spin text-accent/20" /></div>
                ) : analytics.chatbotLeads && analytics.chatbotLeads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="mb-4 text-sm font-bold text-accent/60">{analytics.chatbotLeads.length} lead{analytics.chatbotLeads.length !== 1 ? 's' : ''} captured</div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Date</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Email</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-accent/40">Query Context</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {analytics.chatbotLeads.map((lead: any, idx: number) => (
                          <tr key={idx} className="hover:bg-muted/30 transition-colors">
                            <td className="py-4 text-xs font-mono">{new Date(lead.created_at).toLocaleDateString()}</td>
                            <td className="py-4 text-sm font-bold">{lead.email}</td>
                            <td className="py-4 text-xs text-accent-light max-w-xs truncate">{lead.query || <span className="opacity-30 italic">No context</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-accent/30 font-bold italic">No chatbot email leads yet. Leads appear here once visitors share their email in the chatbot.</div>
                )}
              </div>

              {/* Monetization Insights */}
              <div className="bg-accent text-white rounded-3xl p-10 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Rocket size={28} /> Monetization Insights
                  </h3>
                  <p className="text-white/80 max-w-2xl mb-8 leading-relaxed">
                    Based on current analytics, these are the recommended actions to increase your Personal Brand Moat and Metmov Monetization.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                      <div className="text-xs font-bold uppercase tracking-widest mb-2 text-white/60">Top Topic</div>
                      <div className="text-lg font-bold">
                        {analytics.blogViews[0]?.title || "N/A"}
                      </div>
                      <div className="text-xs mt-2 text-white/40 italic">Create more content in this category.</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                      <div className="text-xs font-bold uppercase tracking-widest mb-2 text-white/60">Chat Intent</div>
                      <div className="text-lg font-bold">
                        {analytics.chatbotQueries.length > 0 ? "Strategic Scaling" : "N/A"}
                      </div>
                      <div className="text-xs mt-2 text-white/40 italic">Common theme in user questions.</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                      <div className="text-xs font-bold uppercase tracking-widest mb-2 text-white/60">Conversion Opp</div>
                      <div className="text-lg font-bold">Fit Call Hook</div>
                      <div className="text-xs mt-2 text-white/40 italic">Users asking about "how to start".</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              </div>
            </div>
          ) : activeTab === 'seo' ? (
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
          ) : activeTab === 'ai-debug' ? (
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
                        value={aiDebugQuery}
                        onChange={(e) => setAiDebugQuery(e.target.value)}
                        placeholder="Ask a methodology question..."
                        className="flex-1 px-4 py-3 rounded-xl border border-border focus:border-accent outline-none transition-all text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && !aiDebugResult.status.includes('loading') && handleAiDebug()}
                      />
                      <button 
                        onClick={handleAiDebug}
                        disabled={aiDebugResult.status === 'loading'}
                        className="btn-primary px-8 py-3 disabled:opacity-50"
                      >
                        {aiDebugResult.status === 'loading' ? 'Testing...' : 'Test AI'}
                      </button>
                    </div>
                  </div>

                  {aiDebugResult.status !== 'idle' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-4">AI Response</h3>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {aiDebugResult.response}
                        </div>
                      </div>

                      <div className="p-6 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 font-mono text-[10px]">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 font-sans">Context Used (Knowledge Base Snippet)</h3>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar leading-relaxed">
                          {aiDebugResult.context || "No context found in Knowledge Base."}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
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
