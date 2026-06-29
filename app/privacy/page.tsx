import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-drover-sage hover:text-drover-ink">
        ← Back to Drover
      </Link>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-drover-sage">Last updated: {new Date().toLocaleDateString('en-AU')}</p>

      <div className="prose mt-8 max-w-none space-y-6 text-drover-bark/90">
        <section>
          <h2 className="text-xl font-semibold">1. Who we are</h2>
          <p>
            Drover (&quot;we&quot;, &quot;us&quot;) provides an agricultural margin
            dashboard for the Australian beef supply chain. This policy explains
            what we collect and how we use it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Information we collect</h2>
          <ul className="list-disc pl-6">
            <li>Account details you provide (name, email, phone) via Firebase Authentication.</li>
            <li>Company and livestock data you enter (mobs, weights, prices, costs, freight).</li>
            <li>Basic usage analytics to improve the product.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. How we use it</h2>
          <p>
            To operate your account, calculate margins, generate AI advisor
            briefs from your own figures, send notifications you opt into, and
            keep the service secure. We do not sell your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Where it is stored</h2>
          <p>
            Account and business data are stored in Google Firebase
            (Firestore/Authentication). Email notifications are sent via EmailJS.
            The AI advisor processes the figures you submit to generate a brief.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Your choices</h2>
          <p>
            You can turn off email notifications in your profile, request
            deletion of your account, and ask for a copy of your data by
            contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Contact</h2>
          <p>
            Questions about this policy? Email{' '}
            <a className="text-drover-grass underline" href="mailto:privacy@drover.app">
              privacy@drover.app
            </a>
            .
          </p>
        </section>

        <p className="text-sm text-drover-sage">
          This is a starter template — have it reviewed against the Australian
          Privacy Principles (APPs) before launch.
        </p>
      </div>
    </main>
  );
}
