import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Blog from './pages/Blog';
import BlogPostDetail from './pages/BlogPostDetail';
import BookCall from './pages/BookCall';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Admin from './pages/Admin';
import Sitemap from './pages/Sitemap';

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

export default function App() {
  return (
    <Router>
      <Analytics />
      <Layout>
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
        </Routes>
      </Layout>
    </Router>
  );
}
