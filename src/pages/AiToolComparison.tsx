import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { LAST_CHECKED_LABEL, priceRows, priceNotes, dataRules, limits, sources } from '../data/aiToolPrices';

const checklist: { lead: string; text: string }[] = [
  { lead: 'Start from where the work already sits.', text: 'Gmail and Docs point to Gemini, and Outlook, Word and Excel point to Copilot. For long reports and analysis across many files, the firm tests Claude and ChatGPT side by side on one real task.' },
  { lead: 'One tool or a mix.', text: 'A firm under 20 people starts with one, because each extra tool means one more data agreement and one more bill.' },
  { lead: 'Team size.', text: 'Claude Team and ChatGPT Business fit 2 to 150 people, and the Google and Microsoft business plans stop at 300.' },
  { lead: 'Data rules.', text: 'Business plan only, written promise of no training, admin controls the owner has actually opened, and no company work on personal accounts.' },
  { lead: 'Budget.', text: 'Seats times price, plus a monthly cost cap with an alert, because agents use 5 to 30 times more AI usage than a chatbot.' },
  { lead: 'Try before committing.', text: 'The firm pays monthly for the first month, runs one task for four weeks, counts the hours saved, then decides on the yearly plan.' },
];

export default function AiToolComparison() {
  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Which AI Tool Fits a Small Team | Anjani Pandey"
        description="Claude, ChatGPT, Gemini and Microsoft Copilot compared on business plan prices, data rules and limits, with a short checklist for choosing. Checked every month."
        canonical="https://www.anjanipandey.com/ai-tools"
      />
      <section className="pt-48 pb-32 md:pt-60 md:pb-48">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <Link to="/resources" className="inline-flex items-center gap-2 text-sm font-bold text-accent/40 hover:text-accent transition-colors mb-12">
              <ArrowLeft size={16} /> Resources
            </Link>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">Which AI tool fits a small team</h1>
            <p className="text-lg text-accent-light mb-2">
              Claude, ChatGPT, Gemini and Microsoft Copilot compared on business plan prices, data rules and limits, with a short checklist for choosing.
            </p>
            <p className="text-sm font-bold text-accent/60 mb-16">Last checked {LAST_CHECKED_LABEL}. Updated every month.</p>

            <h2 className="text-2xl font-bold text-accent mb-4">Prices per user per month</h2>
            <p className="text-accent-light mb-6">
              Every price was read on the maker's own page on {LAST_CHECKED_LABEL}. I use Claude every day for my own work, so read those rows with that in mind.
            </p>
            <div className="overflow-x-auto border border-border rounded-sm mb-6">
              <table className="w-full min-w-[720px] text-sm text-left">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="p-3 font-bold">Tool</th>
                    <th className="p-3 font-bold">Plan</th>
                    <th className="p-3 font-bold">USD, billed yearly</th>
                    <th className="p-3 font-bold">USD, billed monthly</th>
                    <th className="p-3 font-bold">INR</th>
                    <th className="p-3 font-bold">Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {priceRows.map((r) => (
                    <tr key={r.tool + r.plan} className="border-t border-border align-top">
                      <td className="p-3 font-medium">{r.tool}</td>
                      <td className="p-3">{r.plan}</td>
                      <td className="p-3">{r.usdYearly}</td>
                      <td className="p-3">{r.usdMonthly}</td>
                      <td className="p-3">{r.inr}</td>
                      <td className="p-3">{r.seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-accent-light mb-16">
              {priceNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold text-accent mb-4">Data rules on business plans</h2>
            <p className="text-accent-light mb-16">{dataRules}</p>

            <h2 className="text-2xl font-bold text-accent mb-4">Limits the price doesn't show</h2>
            <p className="text-accent-light mb-16">{limits}</p>

            <h2 className="text-2xl font-bold text-accent mb-4">How to choose</h2>
            <p className="text-accent-light mb-6">Work through these six checks in order:</p>
            <ol className="list-decimal pl-6 space-y-4 text-accent-light mb-16">
              {checklist.map((c) => (
                <li key={c.lead}>
                  <strong className="text-accent">{c.lead}</strong> {c.text}
                </li>
              ))}
            </ol>

            <h2 className="text-2xl font-bold text-accent mb-4">Sources</h2>
            <ul className="space-y-2 mb-8">
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{s.label}</a>
                </li>
              ))}
            </ul>
            <p className="text-sm text-accent/60">Last checked {LAST_CHECKED_LABEL}.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
