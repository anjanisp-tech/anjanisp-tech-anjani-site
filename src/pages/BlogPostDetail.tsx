import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, MessageSquare, User, Mail, Globe, Send, Phone } from 'lucide-react';
import Markdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { blogPosts } from '../data/blogData';

interface Comment {
  id: number;
  name: string;
  email: string;
  website?: string;
  phone?: string;
  comment: string;
  parent_id?: number;
  is_admin: number;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
}

export default function BlogPostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    phone: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter form submitted with email:", newsletterEmail);
    if (!newsletterEmail) return;
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Subscription failed:", res.status, data);
        setNewsletterStatus('error');
      }
    } catch (err) {
      console.error("Subscription network error:", err);
      setNewsletterStatus('error');
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      // Fetch Post
      fetch(`/api/posts/${id}`)
        .then(res => res.json())
        .then(data => {
          setPost(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch post", err);
          setIsLoading(false);
        });

      // Fetch Comments
      fetch(`/api/blog/${id}/comments`)
        .then(res => res.json())
        .then(data => setComments(data))
        .catch(err => console.error("Failed to fetch comments:", err));
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`/api/blog/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [newComment, ...prev]);
        setFormData({ name: '', email: '', website: '', phone: '', comment: '' });
        setSubmitStatus('success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server returned error:", response.status, errorData);
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error("Network or client error while submitting comment:", err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-accent-light mb-8">The article you are looking for does not exist or has been moved.</p>
        <Link to="/blog" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <article className="pt-48 pb-32 md:pt-60 md:pb-48">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-accent/40 hover:text-accent transition-colors mb-12">
              <ArrowLeft size={16} /> Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-16">
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-sm font-bold text-accent/40">
                  <Calendar size={16} />
                  {post.date}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-accent/40">
                  <Tag size={16} />
                  <span className="uppercase tracking-widest">{post.category}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                {post.title}
              </h1>
              <p className="text-xl md:text-2xl text-accent-light leading-relaxed italic border-l-4 border-accent pl-6">
                {post.excerpt}
              </p>
            </header>

            {/* Content */}
            <div className="markdown-body prose prose-lg max-w-none prose-accent mb-24">
              <Markdown>{post.content}</Markdown>
            </div>

            {/* Newsletter Section */}
            <div className="bg-accent text-white p-8 md:p-12 rounded-[2rem] my-24 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Want these insights in your inbox?</h3>
                <p className="text-white/80 mb-8 max-w-xl">
                  I share weekly frameworks on operations and scaling for founder-led businesses.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="email" 
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email" 
                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={newsletterStatus === 'loading'}
                    className="bg-white text-accent px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-all disabled:opacity-50"
                  >
                    {newsletterStatus === 'loading' ? 'Joining...' : 'Join Frameworks'}
                  </button>
                </form>
                {newsletterStatus === 'success' && (
                  <p className="mt-4 text-sm font-bold text-white/90 animate-in fade-in slide-in-from-top-2">
                    Welcome! You're now on the list.
                  </p>
                )}
                {newsletterStatus === 'error' && (
                  <p className="mt-4 text-sm font-bold text-red-200 animate-in fade-in slide-in-from-top-2">
                    Something went wrong. Please try again.
                  </p>
                )}
              </div>
              {/* Decorative background element */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Comments Section */}
            <section className="mt-32 pt-16 border-t border-border">
              <div className="flex items-center gap-3 mb-12">
                <MessageSquare className="text-accent" size={24} />
                <h2 className="text-3xl font-bold mb-0">Discussion ({comments.length})</h2>
              </div>

              {/* Comment Form */}
              <div className="bg-muted/30 p-8 rounded-3xl border border-border mb-16">
                <h3 className="text-xl font-bold mb-6">Leave a Comment</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Name *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/20" size={18} />
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your Name" 
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-accent bg-white outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/20" size={18} />
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email Address" 
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-accent bg-white outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Website (Optional)</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/20" size={18} />
                        <input 
                          type="url" 
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://yourwebsite.com" 
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-accent bg-white outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Phone (Optional)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/20" size={18} />
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Your Phone Number" 
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-accent bg-white outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent/40 ml-1">Comment *</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 text-accent/20" size={18} />
                      <textarea 
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        placeholder="Share your thoughts..." 
                        rows={5}
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-border focus:border-accent bg-white outline-none transition-all text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                      <Send size={16} />
                    </button>
                    
                    {submitStatus === 'success' && (
                      <span className="text-sm font-bold text-emerald-600 animate-in fade-in slide-in-from-right-4">
                        Comment posted successfully!
                      </span>
                    )}
                    {submitStatus === 'error' && (
                      <span className="text-sm font-bold text-red-500 animate-in fade-in slide-in-from-right-4">
                        Failed to post comment. Please try again.
                      </span>
                    )}
                  </div>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-8">
                {comments.length > 0 ? (
                  comments.filter(c => !c.parent_id).map((c) => (
                    <div key={c.id} className="space-y-6">
                      <div className="bg-white p-8 rounded-2xl border border-border/50 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-bold text-lg flex items-center gap-3">
                              {c.name}
                              <div className="flex items-center gap-2">
                                {c.website && (
                                  <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-accent/30 hover:text-accent transition-colors" title="Website">
                                    <Globe size={14} />
                                  </a>
                                )}
                                {c.phone && (
                                  <span className="text-accent/30 flex items-center gap-1 text-xs" title="Phone">
                                    <Phone size={12} />
                                    {c.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-accent/30">
                              {new Date(c.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                        <p className="text-accent-light leading-relaxed whitespace-pre-wrap">
                          {c.comment}
                        </p>
                      </div>

                      {/* Replies */}
                      {comments.filter(r => r.parent_id === c.id).map(reply => (
                        <div key={reply.id} className="ml-8 md:ml-16 bg-accent/5 p-6 rounded-2xl border border-accent/10 relative">
                          <div className="absolute -left-4 top-8 w-4 h-px bg-accent/20" />
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-accent text-white text-[10px] flex items-center justify-center rounded-full font-bold">AP</div>
                            <span className="font-bold text-sm text-accent">{reply.name}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent/30">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-accent-light leading-relaxed">
                            {reply.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl">
                    <p className="text-accent/40 font-medium">No comments yet. Be the first to join the discussion!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Author Footer */}
            <footer className="mt-32 pt-12 border-t border-border">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold">AP</div>
                  <div>
                    <div className="font-bold text-lg">Anjani Pandey</div>
                    <div className="text-sm text-accent-light">Fractional COO & Scaling Specialist</div>
                  </div>
                </div>
                <a href="https://calendly.com/metmovllp/30-minute-meeting-metmov-clone" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Book a Diagnostic Call
                </a>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </div>
  );
}
