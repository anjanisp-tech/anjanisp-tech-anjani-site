import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';

// Lazy load pages to reduce initial bundle size
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));
const BookCall = lazy(() => import('./pages/BookCall'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Admin = lazy(() => import('./pages/Admin'));
const Sitemap = lazy(() => import('./pages/Sitemap'));
const BottleneckCostCalculator = lazy(() => import('./pages/BottleneckCostCalculator'));
const Resources = lazy(() => import('./pages/Resources'));

function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      // Use 'event' 'page_view' for manual SPA tracking to ensure it's captured
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
        debug_mode: true
      });
    }
  }, [location]);

  return null;
}

// Loading fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Analytics />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPostDetail />} />
            <Route path="/book" element={<BookCall />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/calculator" element={<BottleneckCostCalculator />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}
