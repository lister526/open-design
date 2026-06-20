import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { SectionHeader, Stat } from '../components/ui';
import { addWaitlist } from '../lib/store';

export function Landing() {
  const { t } = useLocale();
  const navigate = useNavigate();
  return (
    <>
      <Hero t={t} navigate={navigate} />
      <LogosStrip />
      <PainPoints />
      <Workflow />
      <UseCases />
      <Pricing navigate={navigate} />
      <Trust />
      <FinalCta t={t} navigate={navigate} />
    </>
  );
}

/* ----------------------------- HERO ----------------------------- */
function Hero({ t, navigate }: { t: (k: string) => string; navigate: (p: string) => void }) {
  const { money } = useLocale();
  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <div className="absolute inset-0 grain opacity-40" />
      <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />
      <div className="absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent-500/20 blur-[100px]" />
      <div className="container-page relative grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
        <div className="animate-fade-up">
          <span className="chip bg-white/10 text-white/90 ring-1 ring-white/15">{t('hero.badge')}</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">{t('hero.subtitle')}</p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white/[.06] px-4 py-2.5 text-sm font-medium text-accent-400 ring-1 ring-white/10">
            <span>⚡</span> {t('hero.promise')}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate('/audit')} className="btn-primary">{t('hero.ctaPrimary')} →</button>
            <button onClick={() => navigate('/partners')} className="btn bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15">{t('hero.ctaSecondary')}</button>
          </div>
          <p className="mt-4 text-xs text-white/40">{t('hero.note')}</p>
        </div>
        <HeroCard money={money} />
      </div>
    </section>
  );
}

function HeroCard({ money }: { money: (n: number) => string }) {
  return (
    <div className="relative animate-fade-up [animation-delay:120ms]">
      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-ink-900/[.06] bg-ink-900/[.02] px-5 py-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-ink-900">AI Room Audit</div>
          <span className="chip bg-accent-500/15 text-accent-600">★ priority lead</span>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-[auto_1fr]">
          <div className="grid place-items-center">
            <div className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-brand-50 to-accent-400/10 ring-1 ring-brand-200">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-ink-900">87</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-700/50">opp. score</div>
              </div>
            </div>
          </div>
          <div className="space-y-2.5 text-sm">
            <Row label="Room" value="Studio · 28 m² · Osaka" />
            <Row label="Goal" value="Photo-ready short-stay" />
            <Row label="Est. project" value={`${money(4200)} – ${money(8600)}`} />
            <Row label="Recommended" value="Pro Redesign Brief" highlight />
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-ink-900/[.06] border-t border-ink-900/[.06] bg-ink-900/[.02]">
          {[['5 steps', 'to a quote'], ['9 langs', 'localized'], ['8% – 15%', 'project fee']].map(([a, b]) => (
            <div key={a} className="px-4 py-3 text-center">
              <div className="text-sm font-extrabold text-ink-900">{a}</div>
              <div className="text-[11px] text-ink-700/60">{b}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-700/60">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-brand-600' : 'text-ink-900'}`}>{value}</span>
    </div>
  );
}

/* --------------------------- LOGOS / STATS --------------------------- */
function LogosStrip() {
  return (
    <section className="border-b border-ink-900/[.06] bg-white">
      <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value="9 languages" label="Localized UI, currency & units" accent />
        <Stat value="6 buyer types" label="Landlords, operators, designers & more" />
        <Stat value="Quote-ready" label="Every audit ends with a real price range" />
        <Stat value="Supplier-native" label="Built to onboard Asia’s home supply chain" />
      </div>
    </section>
  );
}

/* --------------------------- PAIN POINTS --------------------------- */
const PAINS = [
  {
    audience: 'Landlords & operators', icon: '🏠',
    pain: 'Rooms sit below market rent or empty between tenants — and refurb decisions are slow, opaque and hard to price.',
    fix: 'Get an opportunity score, a scenario-based revenue angle and a buildable refit plan with a real budget range.',
  },
  {
    audience: 'Short-stay hosts', icon: '📸',
    pain: 'Listing photos don’t convert. Guests churn. Restyling means guesswork and uncoordinated vendors.',
    fix: 'A photo-ready transformation brief with a staging kit, lighting plan and local install — coordinated end to end.',
  },
  {
    audience: 'Designers & contractors', icon: '📐',
    pain: 'Hours lost on unpaid proposals and quotes. Leads are unqualified. Sourcing and project tracking live in spreadsheets.',
    fix: 'Turn an intake into a paid proposal and itemized quote in minutes, with matched suppliers and a project pipeline.',
  },
  {
    audience: 'Asian home supply chain', icon: '🏭',
    pain: 'Great products, no path into localized overseas delivery, install and aftercare. Catalogs aren’t buildable.',
    fix: 'Convert SKUs into configurable space modules with cost, lead time, compliance and install complexity built in.',
  },
];

function PainPoints() {
  return (
    <section id="product" className="container-page py-20">
      <SectionHeader
        eyebrow="The problem"
        title="Redesigning a room is a transaction — today it’s a mess."
        subtitle="Design, pricing, sourcing, delivery and install live in different places. SpacePilot AI makes the whole transaction one system."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {PAINS.map((p) => (
          <div key={p.audience} className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">{p.icon}</span>
              <h3 className="text-lg font-bold text-ink-900">{p.audience}</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-700/80"><span className="font-semibold text-rose-600">Pain · </span>{p.pain}</p>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-700/80"><span className="font-semibold text-accent-600">SpacePilot · </span>{p.fix}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- WORKFLOW ----------------------------- */
const STEPS = [
  { n: '01', title: 'Room Intake', desc: 'Structured AI audit: type, size, pain points, budget, style, timeline, photos & floor plan.', icon: '📥' },
  { n: '02', title: 'AI Concept', desc: 'Opportunity score, diagnosis and a module-by-module transformation concept.', icon: '🧠' },
  { n: '03', title: 'Smart Quote', desc: 'Itemized, editable quote across lean / standard / premium bands with platform fee.', icon: '🧾' },
  { n: '04', title: 'Supplier & Installer Match', desc: 'Match components and local partners by city, lead time, compliance and complexity.', icon: '🔗' },
  { n: '05', title: 'Delivery & Aftercare', desc: 'Track status from deposit to completion, plus warranty and aftercare.', icon: '🚚' },
];

function Workflow() {
  return (
    <section className="bg-ink-950 py-20 text-white">
      <div className="container-page">
        <SectionHeader eyebrow="How it works" title="One closed loop, from room scan to delivered space." center />
        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl bg-white/[.04] p-5 ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold text-white/30">{s.n}</span>
              </div>
              <h3 className="mt-4 text-base font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{s.desc}</p>
              {i < STEPS.length - 1 && <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-white/20 lg:block" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- USE CASES ----------------------------- */
const CASES = [
  { tag: 'Storage', title: 'Small apartment storage upgrade', body: 'Vertical and concealed storage modules that reclaim square meters in compact units.' },
  { tag: 'Rental', title: 'Rental refresh for landlords', body: 'A measured refit that targets market rent positioning and reduces void periods.' },
  { tag: 'Short-stay', title: 'Airbnb photo-ready redesign', body: 'Lighting, styling and a staging kit engineered for listing photos that convert.' },
  { tag: 'Designer', title: 'Designer proposal automation', body: 'Turn a client intake into a paid, itemized proposal and quote in minutes.' },
  { tag: 'Accessibility', title: 'Aging-friendly room upgrade', body: 'Accessible fittings, non-slip and grab-rail modules with compliance notes.' },
  { tag: 'Makeover', title: 'Modular kitchen / entryway / bedroom', body: 'Configurable component sets for the highest-ROI rooms in any home.' },
];

function UseCases() {
  return (
    <section id="use-cases" className="container-page py-20">
      <SectionHeader eyebrow="Use cases" title="Profitable, buildable, measurable — not just pretty." subtitle="Start with the highest-ROI transformations. Expand into whole-unit and portfolio programs over time." />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CASES.map((c) => (
          <div key={c.title} className="group card p-6 transition hover:-translate-y-1 hover:shadow-glow">
            <span className="chip bg-brand-50 text-brand-700">{c.tag}</span>
            <h3 className="mt-4 text-lg font-bold text-ink-900">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-700/80">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ PRICING ------------------------------ */
function Pricing({ navigate }: { navigate: (p: string) => void }) {
  const { money } = useLocale();
  const tiers = [
    { name: 'AI Room Audit', price: `${money(49)} – ${money(149)}`, unit: 'per room', cta: 'Start audit', to: '/audit', features: ['Opportunity score', 'AI diagnosis summary', 'Estimated project range', 'Recommended package'], },
    { name: 'Pro Redesign Brief', price: `${money(499)} – ${money(999)}`, unit: 'per room', highlight: true, cta: 'Start audit', to: '/audit', features: ['Full transformation concept', 'Itemized smart quote', 'Module & supplier shortlist', 'Deposit & next-step routing'], },
    { name: 'Turnkey Coordination', price: '8% – 15%', unit: 'project fee', cta: 'Talk to us', to: '/partners', features: ['End-to-end project management', 'Supplier & installer matching', 'Delivery & status tracking', 'Optional warranty & aftercare'], },
    { name: 'Pro (Designer / Contractor)', price: `${money(199)} – ${money(499)}`, unit: 'per month', cta: 'Join Pro', to: '/partners', features: ['Lead matching', 'Proposal & quote automation', 'Project pipeline', 'Sourcing catalog access'], },
  ];
  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-brand-50/40 py-20">
      <div className="container-page">
        <SectionHeader eyebrow="Pricing" title="Designed to capture high-value transactions — not give software away." subtitle="Low-cost audits qualify intent. Paid briefs and project fees drive revenue. Subscriptions and supplier listings build recurring income." center />
        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div key={tier.name} className={`relative flex flex-col rounded-2xl p-6 ${tier.highlight ? 'bg-ink-950 text-white ring-1 ring-brand-500 shadow-glow' : 'card'}`}>
              {tier.highlight && <span className="absolute -top-3 left-6 chip bg-brand-500 text-white">Most revenue</span>}
              <h3 className="text-base font-bold">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold">{tier.price}</span>
                <span className={`text-xs ${tier.highlight ? 'text-white/50' : 'text-ink-700/60'}`}>{tier.unit}</span>
              </div>
              <ul className={`mt-5 flex-1 space-y-2.5 text-sm ${tier.highlight ? 'text-white/75' : 'text-ink-700/80'}`}>
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-accent-500">✓</span>{f}</li>
                ))}
              </ul>
              <button onClick={() => navigate(tier.to)} className={`mt-6 ${tier.highlight ? 'btn-primary' : 'btn-dark'} w-full`}>{tier.cta}</button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-ink-700/60">Property Portfolio Plan — custom, from {money(3000)} onboarding. <button onClick={() => navigate('/partners')} className="font-semibold text-brand-600 hover:underline">Contact sales →</button></p>
      </div>
    </section>
  );
}

/* ------------------------------ TRUST ------------------------------ */
function Trust() {
  const points = [
    { t: 'Built for global localization', d: 'Language, currency, units and country availability are first-class — not an afterthought.' },
    { t: 'Pricing you can act on', d: 'Every concept ends with an itemized, editable quote. No vague “design vibes”.' },
    { t: 'Supplier & install ready', d: 'Components carry cost, lead time, compliance notes and install complexity.' },
    { t: 'Compliant by design', d: 'Outcomes are framed as estimates and scenarios — never guaranteed returns.' },
  ];
  return (
    <section className="container-page py-20">
      <div className="rounded-3xl bg-ink-950 p-8 text-white sm:p-12">
        <SectionHeader eyebrow="Why teams choose SpacePilot" title="Execution, pricing, localization and delivery — in one system." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <div key={p.t}>
              <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-brand-400 to-accent-400" />
              <h3 className="text-base font-bold">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FINAL CTA ----------------------------- */
function FinalCta({ t, navigate }: { t: (k: string) => string; navigate: (p: string) => void }) {
  const [form, setForm] = useState({ email: '', country: '' });
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) return;
    addWaitlist({ email: form.email, kind: 'city', meta: form.country });
    setDone(true);
  }

  return (
    <section className="container-page pb-24">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('cta.title')}</h2>
            <p className="mt-3 max-w-md text-lg text-white/80">{t('cta.subtitle')}</p>
            <button onClick={() => navigate('/audit')} className="btn mt-7 bg-white text-brand-700 hover:bg-white/90">{t('hero.ctaPrimary')} →</button>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur">
            {done ? (
              <div className="py-6 text-center">
                <div className="text-3xl">✅</div>
                <p className="mt-3 font-semibold">You’re on the city launch list.</p>
                <p className="mt-1 text-sm text-white/70">We’ll notify you when SpacePilot launches in your market.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <p className="text-sm font-semibold">Not ready? Join the city launch waitlist.</p>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required placeholder="Work email" className="w-full rounded-xl bg-white/15 px-4 py-3 text-sm text-white placeholder:text-white/50 ring-1 ring-white/20 outline-none focus:ring-2 focus:ring-white" />
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country / city" className="w-full rounded-xl bg-white/15 px-4 py-3 text-sm text-white placeholder:text-white/50 ring-1 ring-white/20 outline-none focus:ring-2 focus:ring-white" />
                <button className="btn w-full bg-white text-brand-700 hover:bg-white/90">Join waitlist</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
