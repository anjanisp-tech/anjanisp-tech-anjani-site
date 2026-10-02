import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import ChapterFigure from '../components/ChapterFigure';
import PostEnding from '../components/PostEnding';
import { blogPosts as seedPosts, type BlogPost } from '../data/blogData';
import { CHAPTERS, chapterBySlug, postsInChapter } from '../data/chapters';
import NotFound from './NotFound';

/** One chapter of the Field Manual: the mechanism, the essays in reading order, the door. */
export default function Chapter() {
  const { slug } = useParams();
  const chapter = chapterBySlug(slug);
  const [posts, setPosts] = useState<BlogPost[]>(seedPosts);

  useEffect(() => {
    fetch('/api/posts?limit=200')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list: BlogPost[] | undefined = Array.isArray(d) ? d : d?.posts;
        if (list && list.length) setPosts(list);
      })
      .catch(() => {});
  }, []);

  if (!chapter) return <NotFound what="chapter" />;

  const essays = postsInChapter(chapter, posts);
  const idx = CHAPTERS.findIndex((c) => c.slug === chapter.slug);
  const prev = CHAPTERS[idx - 1];
  const next = CHAPTERS[idx + 1];
  const url = `https://www.anjanipandey.com/manual/${chapter.slug}`;

  return (
    <>
      <SEO
        title={`${chapter.title} | The Field Manual | Anjani Pandey`}
        description={`${chapter.ask} ${chapter.intro}`}
        canonical={url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${chapter.title} — The Field Manual`,
          "url": url,
          "description": chapter.intro,
          "isPartOf": { "@type": "WebSite", "name": "Anjani Pandey", "url": "https://www.anjanipandey.com" },
          "hasPart": essays.map((p) => ({ "@type": "Article", "headline": p.title, "url": `https://www.anjanipandey.com/blog/${p.id}`, "datePublished": p.date })),
        }}
      />

      <section className="pt-28 md:pt-36 pb-10">
        <div className="container-custom grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-start">
          <div className="grid gap-5 max-w-[46rem]">
            <span className="label-mono-muted"><Link to="/" className="hover:text-primary">The Manual</Link> → Chapter {chapter.number}</span>
            <h1 className="mb-0">{chapter.title}</h1>
            {chapter.method && <span className="label-mono -mt-2">MetMov method · {chapter.method}</span>}
            <p className="text-lg md:text-xl text-accent-light">{chapter.intro}</p>
            {chapter.readFirst.length > 0 && (
              <div className="margin-note">
                <span className="label-mono">Read in this order</span>
                <span>Start with the first {Math.min(chapter.readFirst.length, 3)} below. They set up the rest.</span>
              </div>
            )}
          </div>
          <div className="text-accent border border-border bg-white p-6">
            <ChapterFigure slug={chapter.slug} />
          </div>
        </div>
      </section>

      <section className="pt-4 pb-16">
        <div className="container-custom"><div className="grid gap-3 max-w-[46rem]">
          <span className="label-mono">{essays.length} {essays.length === 1 ? 'essay' : 'essays'}</span>
          <div className="rule-top">
            {essays.map((p, i) => (
              <Link key={p.id} to={`/blog/${p.id}`} className="group grid sm:grid-cols-[110px_1fr] gap-1 sm:gap-5 py-4 border-b border-border">
                <span className="label-mono-muted pt-1">{p.date}</span>
                <div className="grid gap-1">
                  <span className="text-lg md:text-xl font-bold tracking-[-0.02em] text-accent group-hover:text-primary transition-colors">
                    {i < chapter.readFirst.length && <span className="label-mono mr-2">{String(i + 1).padStart(2, '0')}</span>}
                    {p.title}
                  </span>
                  {p.excerpt && <span className="text-sm text-accent-light line-clamp-2">{p.excerpt}</span>}
                </div>
              </Link>
            ))}
            {essays.length === 0 && <p className="py-6 text-accent-light">Nothing filed here yet. The next Wednesday essay may land in this chapter.</p>}
          </div>
        </div></div>
      </section>

      <section className="pt-0 pb-20">
        <div className="container-custom"><div className="max-w-[46rem]">
          <PostEnding chapter={chapter} compact />
          <div className="flex flex-wrap justify-between gap-4 mt-12 text-sm font-bold">
            {prev ? <Link to={`/manual/${prev.slug}`} className="text-accent hover:text-primary">← {prev.number} {prev.title}</Link> : <span />}
            {next && <Link to={`/manual/${next.slug}`} className="text-accent hover:text-primary inline-flex items-center gap-1">{next.number} {next.title} <ArrowRight size={14} /></Link>}
          </div>
        </div></div>
      </section>
    </>
  );
}
