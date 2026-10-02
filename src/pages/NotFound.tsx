import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { CHAPTERS } from '../data/chapters';

/**
 * The page for an address that does not exist (2026-10-02).
 * Before this, any made-up address rendered an empty page with HTTP 200 and a
 * canonical pointing at the home page. Now:
 *  - unknown top-level addresses are served as dist/404.html with a real 404
 *    status (vercel.json no longer sends everything to index.html);
 *  - unknown essays, case studies and guides (which still need the app shell so a
 *    brand-new post works before the next rebuild) render this same page, which
 *    tells search engines not to index it.
 */
export default function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <>
      <Helmet>
        <title>Page not found | Anjani Pandey</title>
        <meta name="robots" content="noindex, follow" data-rh="true" />
      </Helmet>
      <section className="pt-36 pb-24 md:pt-44 md:pb-32">
        <div className="container-custom max-w-3xl grid gap-8">
          <span className="label-mono">404 · not in the manual</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-0">
            This {what} does not exist.
          </h1>
          <p className="text-accent-light text-lg">
            The address may be mistyped, or the {what} has moved. Everything I write is filed
            into one of six chapters. Start with the one that sounds like your week.
          </p>
          <ol className="grid gap-2 border-t border-border pt-6">
            {CHAPTERS.map((c) => (
              <li key={c.slug}>
                <Link to={`/manual/${c.slug}`} className="flex gap-4 items-baseline hover:text-primary">
                  <span className="label-mono w-8">{c.number}</span>
                  <span className="font-bold">{c.title}</span>
                  <span className="text-accent-light text-sm hidden md:inline">{c.ask}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <Link to="/" className="btn-primary gap-2">
              Go to the home page <ArrowRight size={16} />
            </Link>
            <Link to="/writing" className="btn-outline">See all essays</Link>
          </div>
        </div>
      </section>
    </>
  );
}
