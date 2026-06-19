import { Link } from 'react-router-dom';
import { ArrowRight, Filter, X, Loader2, AlertCircle, Search, ArrowDownWideNarrow } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import { blogPosts as seedPosts } from '../data/blogData';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  img?: string;
}

type SortOrder = 'newest' | 'oldest' | 'title';

// Sort options for the blog. The values are sent to /api/posts?sort= and must
// stay in sync with the SORT_CLAUSES whitelist in api/routes/blog.ts.
const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title (A–Z)' },
];

export default function Blog() {
  const LIMIT = 6;
  // Seed from static blogData so the prerender (renderToString) captures real
  // posts instead of a loading spinner. /api/posts still refreshes on mount.
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(seedPosts);
  const [categories, setCategories] = useState<string[]>(
    () => Array.from(new Set(seedPosts.map(p => p.category))).sort((a, b) => a.localeCompare(b))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(seedPosts.length === LIMIT);
  const [offset, setOffset] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // The first client refresh is a silent background refresh over the seeded
  // posts; the spinner only shows for user-triggered filter/search refetches.
  const initialFetchRef = useRef(true);

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
        if (Array.isArray(data)) {
          setCategories([...data].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))));
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchPosts = useCallback(async (currentOffset: number, isInitial: boolean = false, category: string | null = null, search: string = '', sort: SortOrder = 'newest') => {
    // First initial fetch is a silent refresh over seeded posts (no spinner).
    const silentRefresh = isInitial && initialFetchRef.current;
    initialFetchRef.current = false;
    if (isInitial) {
      if (!silentRefresh) setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: currentOffset.toString(),
      });
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);

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
    fetchPosts(0, true, selectedCategory, debouncedSearch, sortOrder);
  }, [selectedCategory, debouncedSearch, sortOrder, fetchPosts]);

  const handleLoadMore = () => {
    fetchPosts(offset, false, selectedCategory, debouncedSearch, sortOrder);
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
      {/* Plain <div>s, not <section>: a global unlayered `section{py-24}` rule
          overrides Tailwind padding utilities, which would re-introduce a large
          dead gap here. */}
      <div className="pt-32 pb-4 md:pt-40 md:pb-6">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="mb-6">Writing</h1>
            <p className="text-xl md:text-2xl text-accent-light leading-relaxed">
              My learnings, observations, and frameworks on operations, scaling, and leadership.
            </p>
          </div>
        </div>
      </div>

      <div className="pb-24">
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

              <div className="space-y-3">
                <label htmlFor="blog-sort" className="text-xs font-bold uppercase tracking-widest text-accent/40 flex items-center gap-2">
                  <ArrowDownWideNarrow size={14} /> Sort
                </label>
                <select
                  id="blog-sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-muted text-accent/70 border border-border/50 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                  <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start sm:items-stretch">
                    {/* Thumbnail on the left. On mobile it keeps the card's native
                        ratio; on sm+ it stretches to match the text-block height
                        (object-left keeps the wordmark + title start visible). */}
                    <Link
                      to={`/blog/${post.id}`}
                      className="block w-full sm:w-48 md:w-60 shrink-0 rounded-xl overflow-hidden border border-border/60 bg-muted aspect-[1200/630] sm:aspect-auto"
                    >
                      {post.img && (
                        <img
                          src={post.img}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </Link>
                    {/* Content on the right */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                        <span className="text-sm font-bold uppercase tracking-widest text-accent/40">{post.date}</span>
                        <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-bold text-accent/60 uppercase tracking-wider">
                          {post.category}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-accent-light transition-colors">
                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                      </h2>
                      <p className="text-lg text-accent-light mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all">
                        Read Article <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                  <div className="h-px bg-border/50 mt-12" />
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
      </div>
    </div>
  );
}
