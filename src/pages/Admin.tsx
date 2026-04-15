import { useState, useEffect } from 'react';
import { MessageSquare, FileText, PlusCircle, Mail, Rocket, Database, BarChart3, Globe, Users, LayoutDashboard, AlertCircle, Loader2 } from 'lucide-react';
import { checkSession, adminPost } from '../admin/useAdminApi';
import type { AdminTab, BlogFormData } from '../admin/types';

// Tab components
import DashboardTab from '../admin/tabs/DashboardTab';
import CommentsTab from '../admin/tabs/CommentsTab';
import UploadBlogTab from '../admin/tabs/UploadBlogTab';
import ManageBlogsTab from '../admin/tabs/ManageBlogsTab';
import KnowledgeTab from '../admin/tabs/KnowledgeTab';
import SubscribersTab from '../admin/tabs/SubscribersTab';
import AllEmailsTab from '../admin/tabs/AllEmailsTab';
import SystemTab from '../admin/tabs/SystemTab';
import AnalyticsTab from '../admin/tabs/AnalyticsTab';
import SeoTab from '../admin/tabs/SeoTab';
import AiDebugTab from '../admin/tabs/AiDebugTab';

const TAB_CONFIG: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'comments', label: 'Comments', icon: <MessageSquare size={18} /> },
  { id: 'upload', label: 'Upload Blog', icon: <PlusCircle size={18} /> },
  { id: 'manage', label: 'Manage Blogs', icon: <FileText size={18} /> },
  { id: 'subscribers', label: 'Subscribers', icon: <Mail size={18} /> },
  { id: 'all-emails', label: 'All Emails', icon: <Users size={18} /> },
  { id: 'knowledge', label: 'Knowledge', icon: <Database size={18} /> },
  { id: 'system', label: 'System', icon: <Rocket size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { id: 'seo', label: 'SEO Pipeline', icon: <Globe size={18} /> },
  { id: 'ai-debug', label: 'AI Debug', icon: <MessageSquare size={18} /> },
];

export default function Admin() {
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Cross-tab state: blog editing flow (Manage -> Upload)
  const [editFormData, setEditFormData] = useState<BlogFormData | null>(null);

  // On mount, check if session cookie is still valid
  useEffect(() => {
    checkSession().then((valid) => {
      setAuthState(valid ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthState('authenticated');
        setPassword('');
      } else {
        const data = await res.json().catch(() => ({ error: 'Login failed' }));
        setLoginError(data.error || 'Incorrect password');
      }
    } catch {
      setLoginError('Network error. Check your connection.');
    }
  };

  const handleLogout = async () => {
    try {
      await adminPost('/api/admin/logout');
    } catch {
      // Clear state regardless
    }
    setAuthState('unauthenticated');
  };

  const handleEditBlog = (formData: BlogFormData) => {
    setEditFormData(formData);
  };

  // Loading state while checking session
  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  // Login screen
  if (authState === 'unauthenticated') {
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
            {loginError && (
              <p className="text-red-600 text-sm font-bold">{loginError}</p>
            )}
            <button type="submit" className="w-full btn-primary py-3">Login</button>
          </form>
          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-accent/40 hover:text-accent">Back to Website</a>
          </div>
        </div>
      </div>
    );
  }

  // Render the active tab content
  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab onNavigate={setActiveTab} />;
      case 'comments':
        return <CommentsTab onAuthExpired={handleLogout} />;
      case 'upload':
        return (
          <UploadBlogTab
            editData={editFormData}
            onEditComplete={() => setEditFormData(null)}
          />
        );
      case 'manage':
        return <ManageBlogsTab onEditBlog={handleEditBlog} onNavigate={setActiveTab} />;
      case 'knowledge':
        return <KnowledgeTab />;
      case 'subscribers':
        return <SubscribersTab />;
      case 'all-emails':
        return <AllEmailsTab />;
      case 'system':
        return <SystemTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'seo':
        return <SeoTab />;
      case 'ai-debug':
        return <AiDebugTab />;
      default:
        return null;
    }
  };

  // Main dashboard shell
  try {
    return (
      <div className="bg-white min-h-screen pt-32 pb-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-accent-light">Manage your blog content and discussions.</p>
            </div>

            <div className="flex flex-wrap bg-muted p-1 rounded-xl gap-0.5">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-accent'
                      : 'text-accent/40 hover:text-accent/60'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-red-400 hover:text-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>

          {renderTab()}
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
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
