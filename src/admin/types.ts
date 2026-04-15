export interface Comment {
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

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  is_premium?: boolean;
}

export interface BlogFormData {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  is_premium: boolean;
}

export interface Subscriber {
  id: number;
  email: string;
  created_at: string;
}

export interface EmailEntry {
  email: string;
  source: string;
  created_at: string;
  metadata: string | null;
}

export interface DashboardData {
  totalEmails: number;
  subscribers: number;
  totalComments: number;
  totalPosts: number;
  chatbotQueries7d: number;
  calculatorUses7d: number;
  emailsBySource: Record<string, number>;
  recentEmails: { email: string; source: string; created_at: string }[];
  topPosts: { title: string; post_id: string; views: number }[];
}

export interface AnalyticsData {
  chatbotQueries: any[];
  blogViews: any[];
  calculatorLeads: any[];
  chatbotLeads: any[];
}

export interface KnowledgeSettings {
  fileId: string;
  lastSync: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  error: string;
}

export interface AiDebugResult {
  response: string;
  context: string;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export interface StatusMessage {
  type: 'success' | 'error' | 'idle';
  message: string;
}

export type AdminTab = 'dashboard' | 'comments' | 'upload' | 'subscribers' | 'system' | 'manage' | 'knowledge' | 'analytics' | 'ai-debug' | 'seo' | 'all-emails';
