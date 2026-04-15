import { useState, useEffect } from 'react';
import { Reply, Trash2 } from 'lucide-react';
import { adminFetch } from '../useAdminApi';
import type { BlogPost, BlogFormData, AdminTab } from '../types';

interface Props {
  onEditBlog: (formData: BlogFormData) => void;
  onNavigate: (tab: AdminTab) => void;
}

export default function ManageBlogsTab({ onEditBlog, onNavigate }: Props) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

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
    try {
      const res = await adminFetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
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

  const handleEditBlog = (post: BlogPost) => {
    onEditBlog({
      title: post.title,
      date: post.date,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      is_premium: !!post.is_premium
    });
    onNavigate('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
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
  );
}
