import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogData';

export default function Sitemap() {
  const baseUrl = 'https://www.anjanipandey.com';
  
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'Book a Call', path: '/book' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Admin Dashboard', path: '/admin' },
  ];

  return (
    <div className="bg-white min-h-screen pt-48 pb-32 md:pt-60 md:pb-48">
      <div className="container-custom">
        <div className="max-w-3xl">
          <h1 className="mb-12">Sitemap</h1>
          
          <div className="grid md:grid-cols-2 gap-16">
            <section>
              <h2 className="text-2xl font-bold mb-6 border-b border-border pb-4">Main Pages</h2>
              <ul className="space-y-4">
                {pages.map(page => (
                  <li key={page.path}>
                    <Link to={page.path} className="text-lg text-accent hover:text-accent-light font-medium flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {page.name}
                    </Link>
                    <div className="text-xs text-accent/40 ml-3.5 mt-1">{baseUrl}{page.path}</div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 border-b border-border pb-4">Blog Articles</h2>
              <ul className="space-y-4">
                {blogPosts.map(post => (
                  <li key={post.id}>
                    <Link to={`/blog/${post.id}`} className="text-lg text-accent hover:text-accent-light font-medium flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {post.title}
                    </Link>
                    <div className="text-xs text-accent/40 ml-3.5 mt-1">{baseUrl}/blog/{post.id}</div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-20 p-8 bg-muted rounded-2xl border border-border">
            <h3 className="text-lg font-bold mb-2">Technical Sitemap</h3>
            <p className="text-accent-light mb-4">
              Search engines can access the XML version of this sitemap here:
            </p>
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              className="text-accent font-bold hover:underline break-all"
            >
              {baseUrl}/sitemap.xml
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
