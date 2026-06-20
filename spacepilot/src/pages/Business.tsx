import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { SectionHeader } from '../components/ui';
import { addWaitlist } from '../lib/store';

const SEGMENTS = [
  { who: 'For landlords', icon: '🏠', value: 'Increase rentability and reduce vacancy friction with measured, buildable refits — framed as scenario-based outcomes, never guaranteed returns.' },
  { who: 'For short-stay operators', icon: '📸', value: 'Photo-ready spaces and faster turnarounds to support listing performance and guest experience.' },
  { who: 'For designers', icon: '📐', value: 'Create faster paid proposals and quotes, win more work, and spend less time on unpaid pitching.' },
  { who: 'For contractors', icon: '🔧', value: 'Receive better-qualified projects with defined scope and budget, plus matched supply.' },
  { who: 'For suppliers', icon: '🏭', value: 'Convert products into configurable space modules and enter localized overseas delivery & install.' },
  { who: 'For consumers', icon: '🛋️', value: 'Get an executable room transformation plan with real pricing — not just inspiration images.' },
];

const ENGINE = [
  { n: '01', t: 'Acquire with AI Room Audit', d: 'A high-signal intake captures high-intent buyers across six segments and nine languages.' },
  { n: '02', t: 'Qualify with paid diagnosis', d: 'A low-cost audit ($49–$149) filters out low-quality demand and self-selects serious buyers.' },
  { n: '03', t: 'Convert with Proposal & Quote', d: 'Buildable proposals drive paid Pro Redesign Briefs ($499–$999) and locked scopes.' },
  { n: '04', t: 'Monetize the transaction', d: 'Project coordination fees (8–15%) and sourcing commissions capture the first real margin.' },
  { n: '05', t: 'Compound with recurring revenue', d: 'Pro subscriptions and supplier listing fees build durable recurring income.' },
  { n: '06', t: 'Defend with local network', d: 'City-by-city supplier + installer networks create a localized execution moat.' },
];

export function Business() {
  const { money } = useLocale();
  return (
    <div>
      <section className="bg-ink-950 py-16 text-white">
        <div className="container-page">
          <span className="chip bg-white/10 text-white/90 ring-1 ring-white/15">Business model</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">We don’t sell software. We capture high-value space transactions.</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">SpacePilot AI uses software to find, qualify and convert high-ticket room transformation demand — then earns on the transaction, the supply and the recurring relationship.</p>
        </div>
      </section>

      {/* who we serve */}
      <section className="container-page py-16">
        <SectionHeader eyebrow="Segments" title="Value proposition, written into the product." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SEGMENTS.map((s) => (
            <div key={s.who} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">{s.icon}</span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{s.who}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700/80">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* revenue engine */}
      <section className="bg-gradient-to-b from-white to-brand-50/40 py-16">
        <div className="container-page">
          <SectionHeader eyebrow="The engine" title="A funnel engineered to monetize at every stage." center />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ENGINE.map((e) => (
              <div key={e.n} className="card p-6">
                <div className="text-xs font-bold text-brand-600">{e.n}</div>
                <h3 className="mt-2 text-lg font-bold text-ink-900">{e.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700/80">{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* revenue streams */}
      <section className="container-page py-16">
        <SectionHeader eyebrow="Revenue streams" title="Five ways the product earns." />
        <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-ink-900/[.07]">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[.03] text-left text-xs font-bold uppercase tracking-wider text-ink-700/50">
              <tr><th className="px-4 py-3">Stream</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Role</th></tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[.06] bg-white">
              {[
                ['AI Room Audit', `${money(49)}–${money(149)}`, 'Qualify intent, monetize early'],
                ['Pro Redesign Brief', `${money(499)}–${money(999)}`, 'Primary conversion product'],
                ['Turnkey coordination fee', '8%–15% of project', 'First real margin / first capital'],
                ['Pro subscription', `${money(199)}–${money(499)}/mo`, 'Recurring revenue from partners'],
                ['Supplier listing & take rate', 'Catalog margin + fees', 'Recurring supply-side revenue'],
              ].map((r) => (
                <tr key={r[0]}>
                  <td className="px-4 py-3 font-semibold text-ink-900">{r[0]}</td>
                  <td className="px-4 py-3 text-brand-700 font-semibold">{r[1]}</td>
                  <td className="px-4 py-3 text-ink-700/80">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* moat */}
      <section className="container-page pb-8">
        <div className="rounded-3xl bg-ink-950 p-8 text-white sm:p-12">
          <SectionHeader eyebrow="The long game" title="From room audits to global space-transaction infrastructure." />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'Local execution moat', d: 'Supplier + installer networks built city by city are hard to replicate.' },
              { t: 'Data on real transactions', d: 'Every audit, quote and project trains better pricing and matching.' },
              { t: 'Supply-chain on-ramp', d: 'Asian manufacturers gain a localized overseas delivery channel.' },
              { t: 'Future rails', d: 'Real 3D/AR, supply ERP, payments, logistics, install, finance & insurance.' },
            ].map((m) => (
              <div key={m.t}>
                <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-brand-400 to-accent-400" />
                <h3 className="text-base font-bold">{m.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Growth />
    </div>
  );
}

/* ----------------------------- GROWTH ----------------------------- */
function Growth() {
  const [refDone, setRefDone] = useState(false);
  const refCode = 'SP-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  const [cityEmail, setCityEmail] = useState('');
  const [cityDone, setCityDone] = useState(false);

  function joinCity(e: React.FormEvent) {
    e.preventDefault();
    if (!cityEmail) return;
    addWaitlist({ email: cityEmail, kind: 'city' });
    setCityDone(true);
  }

  return (
    <section className="container-page py-16">
      <SectionHeader eyebrow="Growth system" title="Built-in loops to compound demand." />
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* referral */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-ink-900">Referral program</h3>
          <p className="mt-2 text-sm text-ink-700/80">Share your code. Both sides get credit toward a project.</p>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-900/[.04] p-2">
            <code className="flex-1 px-2 text-sm font-bold text-ink-900">{refCode}</code>
            <button onClick={() => { navigator.clipboard?.writeText(refCode); setRefDone(true); }} className="btn-dark !px-3 !py-1.5 text-xs">{refDone ? 'Copied ✓' : 'Copy'}</button>
          </div>
        </div>

        {/* case study generator */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-ink-900">Before / After case study</h3>
          <p className="mt-2 text-sm text-ink-700/80">Auto-generate a shareable case study from any completed project.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="grid h-16 place-items-center rounded-lg bg-gradient-to-br from-stone-200 to-stone-100 text-xs font-semibold text-ink-700/60">Before</div>
            <div className="grid h-16 place-items-center rounded-lg bg-gradient-to-br from-brand-100 to-accent-400/20 text-xs font-semibold text-brand-700">After</div>
          </div>
          <button className="btn-ghost mt-3 w-full text-sm">Generate case study (placeholder)</button>
        </div>

        {/* city waitlist */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-ink-900">City launch waitlist</h3>
          <p className="mt-2 text-sm text-ink-700/80">Be first when we open your market.</p>
          {cityDone ? (
            <p className="mt-4 rounded-xl bg-accent-500/10 px-4 py-3 text-sm font-semibold text-accent-700">You’re on the list ✓</p>
          ) : (
            <form onSubmit={joinCity} className="mt-4 flex gap-2">
              <input value={cityEmail} onChange={(e) => setCityEmail(e.target.value)} type="email" required placeholder="Email" className="input !py-2.5" />
              <button className="btn-primary !px-4 !py-2.5 text-sm">Join</button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-brand-50/60 p-6 text-center ring-1 ring-brand-100">
        <p className="text-sm font-semibold text-ink-900">Want to test paid demand with your own rooms?</p>
        <Link to="/audit" className="btn-primary mt-3 inline-flex">Start AI Room Audit →</Link>
      </div>
    </section>
  );
}
