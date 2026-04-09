import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
}

export default function SEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogImage = 'https://www.anjanipandey.com/og-image.png',
  twitterCard = 'summary_large_image',
}: SEOProps) {
  const siteTitle = "Anjani Pandey | Operating Spine & Scaling Specialist";
  const fullTitle = title ? `${title}` : siteTitle;
  const siteDescription = "I help $1M-$10M ARR businesses diagnose structural bottlenecks and build operating spines that scale. Founder, MetMov LLP. Based in Bengaluru.";
  const fullDescription = description || siteDescription;
  const fullCanonical = canonical || "https://www.anjanipandey.com/";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || fullDescription} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:title" content={ogTitle || fullTitle} />
      <meta property="twitter:description" content={ogDescription || fullDescription} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
}
