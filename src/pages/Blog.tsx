import { Link } from 'react-router-dom';
import { ArrowRight, Filter, X, Loader2, AlertCircle, Search } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import SEO from '../components/SEO';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
}

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 6;

  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchPosts = useCallback(async (currentOffset: number, isInitial: boolean = false, category: string | null = null, search: string = '') => {
    if (isInitial) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: currentOffset.toString(),
      });
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorMsg = data.details || data.error || `Server error: ${res.status}`;
        throw new Error(errorMsg);
      }
      const data = await res.json();
      
      if (data.status === 'error') {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to fetch posts");
        throw new Error(errorMsg);
      }
      
      if (isInitial) {
        setBlogPosts(data);
      } else {
        setBlogPosts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === LIMIT);
      setOffset(currentOffset + data.length);
    } catch (err: any) {
      console.error("Failed to fetch posts", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts(0, true, selectedCategory, debouncedSearch);
  }, [selectedCategory, debouncedSearch, fetchPosts]);

  const handleLoadMore = () => {
    fetchPosts(offset, false, selectedCategory, debouncedSearch);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setNewsletterStatus('error');
      }
    } catch (err) {
      setNewsletterStatus('error');
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-100 max-w-2xl w-full text-center">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title="Writing | Systems, Scale & AI | Anjani Pandey"
        description="Insights on scaling operations, building systems, and breaking free from the founder trap. By Anjani Pandey."
        canonical="https://www.anjanipandey.com/writing"
      />
      <section className="pt-32 pb-6 md:pt-40 md:pb-10">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="mb-6">Writing</h1>
            <p className="text-xl md:text-2xl text-accent-light leading-relaxed">
              My learnings, observations, and frameworks on operations, scaling, and leadership.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-custom">
          {/* Search & Filters */}
          <div className="mb-16 space-y-8 border-b border-border pb-8">
            <div className="max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/30" size={20} />
              <input 
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-muted border border-border/50 rounded-2xl outline-none focus:border-accent transition-all text-sm font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-8 items-end">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-accent/40 flex items-center gap-2">
                  <Filter size={14} /> Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        selectedCategory === cat
                          ? 'bg-primary text-white border-primary'
                          : 'bg-muted text-accent/60 border-border/50 hover:border-primary/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {(selectedCategory || searchQuery) && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-xs font-bold text-accent/40 hover:text-accent transition-colors pb-2"
                >
                  <X size={14} /> Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-16">
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="animate-spin text-accent" size={32} />
              </div>
            ) : blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <article key={post.id} className="group">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="md:w-1/4">
                      <div className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-2">{post.date}</div>
                      <div className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-bold text-accent/60 uppercase tracking-wider">
                        {post.category}
                      </div>
                    </div>
                    <div className="md:w-3/4">
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-accent-light transition-colors">
                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                      </h2>
                      <p className="text-lg text-accent-light mb-6 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all">
                        Read Article <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                  <div className="h-px bg-border/50 mt-16" />
                </article>
              ))
            ) : (
              <div className="py-20 text-center">
                <h3 className="text-xl font-bold text-accent/40">No articles found matching your search.</h3>
                <button onClick={clearFilters} className="mt-4 text-accent font-bold hover:underline">Clear all filters</button>
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && !isLoading && (
            <div className="mt-20 text-center">
              <button 
                onClick={handleLoadMore}
                disabled={isFetchingMore}
                className="btn-outline min-w-[200px] gap-3"
              >
                {isFetchingMore ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Articles
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          <div className="mt-32 bg-muted p-12 rounded-3xl text-center">
            <h3 className="text-2xl font-bold mb-4">Want these insights in your inbox?</h3>
            <p className="text-accent-light mb-8 max-w-md mx-auto">
              I share weekly frameworks on operations and scaling for founder-led businesses.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Email Address" 
                className="flex-grow px-6 py-3 rounded-md border border-border focus:border-accent outline-none"
              />
              <button 
                type="submit" 
                disabled={newsletterStatus === 'loading'}
                className="btn-primary disabled:opacity-50"
              >
                {newsletterStatus === 'loading' ? 'Joining...' : 'Subscribe'}
              </button>
            </form>
            {newsletterStatus === 'success' && (
              <p className="mt-4 text-sm font-bold text-slate-900">
                Welcome! You're now on the list.
              </p>
            )}
            {newsletterStatus === 'error' && (
              <p className="mt-4 text-sm font-bold text-red-500">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
