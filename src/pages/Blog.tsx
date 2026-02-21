import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { blogPosts } from '../data/blogData';

export default function Blog() {
  return (
    <div className="bg-white min-h-screen">
      <section className="pt-48 pb-20 md:pt-60 md:pb-32">
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
          <div className="grid gap-16">
            {blogPosts.map((post) => (
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
            ))}
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
