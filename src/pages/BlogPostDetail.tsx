import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import Markdown from 'react-markdown';
import { blogPosts } from '../data/blogData';

export default function BlogPostDetail() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

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
            <div className="markdown-body prose prose-lg max-w-none prose-accent">
              <Markdown>{post.content}</Markdown>
            </div>

            {/* Footer */}
            <footer className="mt-24 pt-12 border-t border-border">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold">AP</div>
                  <div>
                    <div className="font-bold text-lg">Anjani Pandey</div>
                    <div className="text-sm text-accent-light">Fractional COO & Scaling Specialist</div>
                  </div>
                </div>
                <Link to="/book" className="btn-primary">
                  Book a Diagnostic Call
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </div>
  );
}
