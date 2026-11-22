import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// Search page S23 (growth plan 8A), copy approved by Anjani 2026-11-22.
// Text is the approved draft word for word: _drafts\growth_week_2026-11-21\S23_ai_training_page_anjanipandey_DRAFT_2026-11-21.md

const leavesWith: string[] = [
  'One AI helper each person built and saw working.',
  'A one-page step guide to repeat it on their own work.',
  'A plain rule for when to trust an AI answer and when to check it.',
  'A short list of the first jobs worth handing to AI in your firm.',
];

export default function AiTraining() {
  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="AI Training for Employees in India | Anjani Pandey"
        description="A hands-on team workshop where each person builds a working AI helper on their own laptop, learns when to trust an AI answer, and leaves with a step guide."
        canonical="https://www.anjanipandey.com/ai-training"
      />
      <section className="pt-48 pb-32 md:pt-60 md:pb-48">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <Link to="/services" className="inline-flex items-center gap-2 text-sm font-bold text-accent/40 hover:text-accent transition-colors mb-12">
              <ArrowLeft size={16} /> Services
            </Link>

            <h1 className="text-4xl md:text-6xl font-bold mb-10">AI training for employees in India</h1>
            <p className="text-lg text-accent-light mb-16">
              Most firms I talk to have done the easy part already. Everyone got an AI login. A few people use it every day, most opened it once, and nobody is sure which answers are safe to trust. A team workshop fixes that by having each person build something that works on their own laptop, in one session.
            </p>

            <h2 className="text-2xl font-bold text-accent mb-4">Who this is for</h2>
            <p className="text-accent-light mb-12">
              This is for owners and leaders of small, growing firms in India who want their whole team using AI, not only the two people who taught themselves. I shape it to the size of your team. I run it in person or online, in English or Hindi-English.
            </p>

            <h2 className="text-2xl font-bold text-accent mb-4">What happens in the session</h2>
            <p className="text-accent-light mb-4">
              It starts as a conversation, not a lecture. I share real stories from the AI system I run every day for my own work, including the places where it went wrong and how I caught it.
            </p>
            <p className="text-accent-light mb-4">
              Then everyone builds. Each person makes a working AI helper on their own laptop, step by step, with me in the room. We use practice data made for the session, so no company data leaves the room. I shape the examples to your team's work and the tools you already pay for.
            </p>
            <p className="text-accent-light mb-12">
              We also spend time on where AI gets it wrong. Each person learns a few simple checks that catch a bad answer before it reaches a customer or a report.
            </p>

            <h2 className="text-2xl font-bold text-accent mb-4">What your team leaves with</h2>
            <ul className="list-disc pl-6 space-y-2 text-accent-light mb-12">
              {leavesWith.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold text-accent mb-4">Where it has run</h2>
            <p className="text-accent-light mb-12">
              On 2026-10-09 I ran a fireside chat with a 20-minute hands-on build for GO DESi in Bengaluru. About 30 people joined, in the room and on Teams. The workshop on this page grew out of that session.
            </p>

            <h2 className="text-2xl font-bold text-accent mb-4">How to start</h2>
            <p className="text-accent-light mb-4">
              Start with the free AI check. It has 11 short questions and gives the owner a score and the weakest area to work on:{' '}
              <Link to="/ai-check" className="font-bold text-accent underline underline-offset-4">AI check</Link>.
            </p>
            <p className="text-accent-light mb-12">
              Then <Link to="/book" className="font-bold text-accent underline underline-offset-4">book a short call</Link> and tell me your company, your team size and what you want people to leave with. We agree the scope and the price on that call.
            </p>

            <h2 className="text-2xl font-bold text-accent mb-4">After the workshop</h2>
            <p className="text-accent-light">
              Some firms want a plan before they buy another AI tool. For them I run an{' '}
              <Link to="/services" className="font-bold text-accent underline underline-offset-4">AI Readiness Review</Link> over 2 to 3 weeks. I look at how the team works today, pick the first jobs worth handing to AI, and build one of them on the firm's own data. Firms that want AI set up across the whole business go on to{' '}
              <a href="https://www.metmov.com" className="font-bold text-accent underline underline-offset-4">MetMov</a>, the firm I co-founded.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
