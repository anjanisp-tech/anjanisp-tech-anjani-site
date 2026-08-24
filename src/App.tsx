import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import ConsentBanner from './components/ConsentBanner';

// Charter rank 2 (2026-08-20): the blank white first screen.
// Home and BlogPostDetail were lazy(). On the client, React replaced the
// prerendered HTML with the Suspense spinner until the chunk downloaded, which
// on a mid-range Android reads as a blank screen. These two carry the whole
// charter (the credibility check and every warm reader), so they load eagerly.
// Everything else stays code-split.
import Home from './pages/Home';
import BlogPostDetail from './pages/BlogPostDetail';

// Lazy load the remaining pages to keep the initial bundle small
const Services = lazy(() => import('./pages/Services'));
const Blog = lazy(() => import('./pages/Blog'));
const BookCall = lazy(() => import('./pages/BookCall'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Admin = lazy(() => import('./pages/Admin'));
const Sitemap = lazy(() => import('./pages/Sitemap'));
const BottleneckCostCalculator = lazy(() => import('./pages/BottleneckCostCalculator'));
const Resources = lazy(() => import('./pages/Resources'));
const ResourceGuideDetail = lazy(() => import('./pages/ResourceGuideDetail'));
const About = lazy(() => import('./pages/About'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail'));

function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      // Use 'event' 'page_view' for manual SPA tracking to ensure it's captured
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
        debug_mode: false
      });
    }
  }, [location]);

  // Primary-path funnel instrumentation (added 2026-07-04).
  // Most "Book a Call" CTAs (header/footer/hero/About) link straight to Cal.com in a new tab,
  // bypassing /book — so close_convert_lead never fired for the path most users take.
  // This delegated, capture-phase listener fires an ADDITIVE top-of-funnel intent event on any
  // outbound Cal.com click. It never preventDefaults (navigation is untouched) and does NOT
  // replace close_convert_lead, which still marks a confirmed booking/inquiry on /book.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href.includes('cal.com/anjanipandey') && typeof window.gtag === 'function') {
        window.gtag('event', 'book_call_click', {
          method: 'cta_outbound',
          destination: href,
          page_path: window.location.pathname
        });
      }
      // Charter rank 1 (2026-08-20). Counts readers routed from a post to the
      // Operating Spine offer. Pairs with the utm tags on OPERATING_SPINE_URL.
      if (href.includes('metmov.com/operating-spine') && typeof window.gtag === 'function') {
        window.gtag('event', 'operating_spine_click', {
          method: 'post_cta',
          destination: href,
          page_path: window.location.pathname
        });
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

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
      <ConsentBanner />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/writing" element={<Blog />} />
            <Route path="/blog" element={<Navigate to="/writing" replace />} />
            <Route path="/blog/:id" element={<BlogPostDetail />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/book" element={<BookCall />} />
            <Route path="/book-call" element={<Navigate to="/book" replace />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/calculator" element={<BottleneckCostCalculator />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:slug" element={<ResourceGuideDetail />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}