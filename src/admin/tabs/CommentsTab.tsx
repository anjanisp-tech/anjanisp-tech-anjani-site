import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Reply, Send } from 'lucide-react';
import { adminFetch } from '../useAdminApi';
import type { Comment } from '../types';

interface Props {
  onAuthExpired: () => void;
}

export default function CommentsTab({ onAuthExpired }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      // Fetch debug info for status bar
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

      const res = await adminFetch('/api/admin/comments');

      if (res.status === 401) {
        onAuthExpired();
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

  const handleDeleteComment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await adminFetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
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

  return (
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
  );
}
