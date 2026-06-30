import Link from 'next/link';
import ScrollHero from './components/ScrollHero';
import Reveal from '@/components/Reveal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { STAGES } from '@/lib/supplyChain';

const FEATURES = [
  {
    title: 'Live prices, every stage',
    body: 'Buy and sell prices sourced for post-breeding, backgrounding, feedlot and processing — kept in AUD, with provenance on every number.',
  },
  {
    title: 'Margins that actually add up',
    body: 'Lock in a mob at its purchase price and watch real trade margins flow through each stage to processing and export.',
  },
  {
    title: 'Route optimisation',
    body: 'Compare scenarios — e.g. live export direct from Darwin vs. trucking south to a feedlot — on freight data you supply.',
  },
  {
    title: 'AI advisor',
    body: 'A concise written evaluation of your scenario, grounded only in your real figures — never invented numbers.',
  },
  {
    title: 'Excel export',
    body: 'Send any margin breakdown straight to a spreadsheet for the office or the bank.',
  },
  {
    title: 'Team management',
    body: 'Company profiles with role-based access — company admins manage their own users; you control the rest.',
  },
];

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />

      {/* Cinematic scroll-scrub hero (video scrubs as you scroll) */}
      <ScrollHero />

      {/* Pitch */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-drover-grass">
          Australian beef supply chain
        </p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Know your margin before the cattle move.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-drover-bark/80">
          Drover follows a mob from the breeder paddock to the abattoir, pricing
          every stage so you can decide the most profitable path — and prove it
          with the numbers.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/login" className="btn-primary">
            Get started
          </Link>
          <Link href="#stages" className="btn-ghost">
            See the stages
          </Link>
        </div>
      </section>

      {/* Stages */}
      <section id="stages" className="bg-drover-bark py-24 text-drover-bone">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Four stages, one continuous margin
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {STAGES.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-drover-fern/40 hover:bg-white/10">
                  <div className="text-sm font-semibold text-drover-gold">0{i + 1}</div>
                  <h3 className="mt-2 text-xl font-medium">{s.label}</h3>
                  <p className="mt-3 text-sm text-drover-bone/70">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="card-interactive h-full">
                <h3 className="text-lg font-medium">{f.title}</h3>
                <p className="mt-3 text-sm text-drover-bark/70">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl bg-drover-paddock px-8 py-16 text-center text-drover-bone">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Put a number on every paddock.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-drover-bone/80">
            Set up your company, load a mob, and see the margin to processing and
            export.
          </p>
          <Link href="/login" className="btn mt-8 bg-drover-bone text-drover-ink hover:bg-white">
            Create your account
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
