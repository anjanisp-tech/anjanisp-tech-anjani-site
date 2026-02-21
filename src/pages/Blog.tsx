import { Link } from 'react-router-dom';
import { ArrowRight, Filter, X, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // Format: "YYYY-MM"

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setBlogPosts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch posts", err);
        setIsLoading(false);
      });
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(blogPosts.map(post => post.category)));
  }, [blogPosts]);

  // Extract unique months (Format: "Month YYYY")
  const months = useMemo(() => {
    const monthMap = new Map<string, string>(); // "YYYY-MM" -> "Month YYYY"
    blogPosts.forEach(post => {
      const parts = post.date.split('-');
      if (parts.length === 3) {
        const monthStr = parts[1];
        const yearStr = parts[2];
        const key = `${yearStr}-${monthStr}`;
        monthMap.set(key, `${monthStr} ${yearStr}`);
      }
    });
    return Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [blogPosts]);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const categoryMatch = !selectedCategory || post.category === selectedCategory;
      
      let dateMatch = true;
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        dateMatch = post.date.includes(month) && post.date.includes(year);
      }
      
      return categoryMatch && dateMatch;
    });
  }, [selectedCategory, selectedMonth, blogPosts]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedMonth(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="pt-48 pb-12 md:pt-60 md:pb-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="mb-6">Personal Blog</h1>
            <p className="text-xl md:text-2xl text-accent-light leading-relaxed">
              My learnings, observations, and frameworks on operations, scaling, and leadership.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-40">
        <div className="container-custom">
          {/* Filters */}
          <div className="mb-16 flex flex-wrap gap-8 items-end border-b border-border pb-8">
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
                        ? 'bg-accent text-white border-accent' 
                        : 'bg-muted text-accent/60 border-border/50 hover:border-accent/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-accent/40 flex items-center gap-2">
                <Filter size={14} /> Date
              </label>
              <select 
                value={selectedMonth || ''} 
                onChange={(e) => setSelectedMonth(e.target.value || null)}
                className="bg-muted border border-border/50 rounded-lg px-4 py-2 text-xs font-bold text-accent/70 outline-none focus:border-accent transition-all"
              >
                <option value="">All Time</option>
                {months.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {(selectedCategory || selectedMonth) && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 text-xs font-bold text-accent/40 hover:text-accent transition-colors pb-2"
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>

          <div className="grid gap-16">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
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
                      <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 font-bold text-accent hover:gap-3 transition-all">
                        Read Article <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                  <div className="h-px bg-border/50 mt-16" />
                </article>
              ))
            ) : (
              <div className="py-20 text-center">
                <h3 className="text-xl font-bold text-accent/40">No articles found matching your filters.</h3>
                <button onClick={clearFilters} className="mt-4 text-accent font-bold hover:underline">Clear all filters</button>
              </div>
            )}
          </div>

          <div className="mt-32 bg-muted p-12 rounded-3xl text-center">
            <h3 className="text-2xl font-bold mb-4">Want these insights in your inbox?</h3>
            <p className="text-accent-light mb-8 max-w-md mx-auto">
              I share weekly frameworks on operations and scaling for founder-led businesses.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email Address" 
                className="flex-grow px-6 py-3 rounded-md border border-border focus:border-accent outline-none"
              />
              <button className="btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
