/**
 * Server-side entry point for pre-rendering.
 * Exports a render(url) function that returns HTML + head tags.
 * All React/Router/Helmet imports are co-located to avoid duplicate instances.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Direct imports (not lazy) for SSR
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Blog from './pages/Blog';
import BookCall from './pages/BookCall';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Sitemap from './pages/Sitemap';
import BottleneckCostCalculator from './pages/BottleneckCostCalculator';
import Resources from './pages/Resources';
import ResourceGuideDetail from './pages/ResourceGuideDetail';
import About from './pages/About';
import SEO from './components/SEO';
import { blogPosts } from './data/blogData';

/**
 * SSR-specific BlogPostDetail that reads from blogData synchronously
 * instead of fetching from /api/posts/:id (useEffect doesn't run in renderToString)
 */
function SSRBlogPostDetail() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={`${post.title} | Anjani Pandey`}
        description={post.excerpt}
        canonical={`https://www.anjanipandey.com/blog/${post.id}`}
        ogType="article"
      />
      <article className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-accent-light mb-8">{post.excerpt}</p>
          </div>
        </div>
      </article>
    </div>
  );
}

function StaticApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/writing" element={<Blog />} />
        <Route path="/blog" element={<Navigate to="/writing" replace />} />
        <Route path="/blog/:id" element={<SSRBlogPostDetail />} />
        <Route path="/book" element={<BookCall />} />
        <Route path="/book-call" element={<Navigate to="/book" replace />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/calculator" element={<BottleneckCostCalculator />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:slug" element={<ResourceGuideDetail />} />
      </Routes>
    </Layout>
  );
}

export interface RenderResult {
  html: string;
  headTags: string;
  title: string;
}

/**
 * Render a given URL path to static HTML.
 * Returns the rendered body HTML and extracted <head> tags from Helmet.
 */
export function render(url: string): RenderResult {
  const helmetContext: any = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <StaticApp />
      </StaticRouter>
    </HelmetProvider>
  );

  const helmet = helmetContext.helmet;
  const headTags = [
    helmet?.title?.toString() || '',
    helmet?.meta?.toString() || '',
    helmet?.link?.toString() || '',
    helmet?.script?.toString() || '',
  ].filter(Boolean).join('\n    ');

  return {
    html,
    headTags,
    title: helmet?.title?.toString() || '',
  };
}
