import { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { SectionHeader } from '../components/ui';
import { SUPPLIER_COMPONENTS, PARTNERS } from '../data/seed';
import { addPartnerApp, addWaitlist } from '../lib/store';

const PARTNER_VALUE = [
  { who: 'Designers', icon: '📐', value: 'Create faster, paid proposals. Convert intake into itemized quotes and win more projects with less unpaid work.' },
  { who: 'Contractors', icon: '🔧', value: 'Receive better-qualified projects with scope and budget already defined. Spend time building, not chasing leads.' },
  { who: 'Installers', icon: '🛠️', value: 'Get matched to local jobs by capacity, complexity and timeline. Predictable pipeline, transparent commissions.' },
  { who: 'Suppliers', icon: '🏭', value: 'Convert products into configurable space modules and enter a localized overseas delivery and install network.' },
];

export function Partners() {
  const { money } = useLocale();
  return (
    <div>
      {/* hero */}
      <section className="bg-ink-950 py-16 text-white">
        <div className="container-page">
          <span className="chip bg-white/10 text-white/90 ring-1 ring-white/15">Partner & Pro portal</span>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">Get matched to qualified, scoped, ready-to-build projects.</h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">Designers, contractors, installers and suppliers plug into the SpacePilot transaction network — with lead matching, proposal tooling and a project pipeline.</p>
        </div>
      </section>

      {/* value */}
      <section className="container-page py-16">
        <SectionHeader eyebrow="Why join" title="Clear value for every partner type." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNER_VALUE.map((p) => (
            <div key={p.who} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">{p.icon}</span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{p.who}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700/80">{p.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* pro plan + lead matching */}
      <section className="bg-gradient-to-b from-white to-brand-50/40 py-16">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div className="card p-7">
            <h2 className="text-xl font-bold text-ink-900">Pro subscription</h2>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-ink-900">{money(199)}–{money(499)}</span>
              <span className="text-sm text-ink-700/60">/ month</span>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-700/80">
              {['Qualified lead matching by city & skill', 'Proposal & quote automation', 'Project management pipeline preview', 'Sourcing catalog at partner pricing', 'Shareable proposal links & referral codes'].map((f) => (
                <li key={f} className="flex gap-2"><span className="text-accent-500">✓</span>{f}</li>
              ))}
            </ul>
          </div>
          <div className="card p-7">
            <h2 className="text-xl font-bold text-ink-900">How lead matching works</h2>
            <ol className="mt-5 space-y-4 text-sm text-ink-700/80">
              {[
                'A consumer or operator completes an AI Room Audit and is scored for intent.',
                'High-intent, in-area leads are routed to matched Pro partners by skill & capacity.',
                'You send a SpacePilot-generated proposal & quote — or customize your own.',
                'On a won project, the platform coordination fee or commission applies transparently.',
              ].map((s, i) => (
                <li key={i} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* partner network */}
      <section className="container-page py-16">
        <SectionHeader eyebrow="Network" title="A growing local partner network." subtitle="Representative partners across launch markets. We never display fake clients or fabricated logos." />
        <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-ink-900/[.07]">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[.03] text-left text-xs font-bold uppercase tracking-wider text-ink-700/50">
              <tr>
                <th className="px-4 py-3">Partner</th><th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Service area</th><th className="hidden px-4 py-3 sm:table-cell">Skills</th>
                <th className="px-4 py-3">Rating</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[.06] bg-white">
              {PARTNERS.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-semibold text-ink-900">{p.name}</td>
                  <td className="px-4 py-3 capitalize text-ink-700/80">{p.type}</td>
                  <td className="px-4 py-3 text-ink-700/80">{p.serviceArea}</td>
                  <td className="hidden px-4 py-3 text-ink-700/70 sm:table-cell">{p.skills.join(', ')}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">★ {p.rating}</td>
                  <td className="px-4 py-3"><span className={`chip ${p.status === 'active' ? 'bg-emerald-500/12 text-emerald-700' : 'bg-amber-500/15 text-amber-700'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SupplierCatalog />
      <PartnerOnboard />
    </div>
  );
}

/* ----------------------- SUPPLIER CATALOG ----------------------- */
function SupplierCatalog() {
  const { money } = useLocale();
  const [cat, setCat] = useState('All');
  const cats = ['All', ...Array.from(new Set(SUPPLIER_COMPONENTS.map((c) => c.category)))];
  const list = cat === 'All' ? SUPPLIER_COMPONENTS : SUPPLIER_COMPONENTS.filter((c) => c.category === cat);

  return (
    <section id="catalog" className="bg-ink-950 py-16 text-white">
      <div className="container-page">
        <SectionHeader eyebrow="Supplier / component catalog" title="Products become configurable space modules." />
        <div className="mt-6 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${cat === c ? 'bg-white text-ink-900' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}>{c}</button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const margin = Math.round(((c.retailUsd - c.costUsd) / c.retailUsd) * 100);
            return (
              <div key={c.id} className="rounded-2xl bg-white/[.04] p-5 ring-1 ring-white/10">
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-2xl">{c.image}</span>
                  <span className="chip bg-accent-500/15 text-accent-400">{margin}% margin</span>
                </div>
                <h3 className="mt-4 text-base font-bold">{c.name}</h3>
                <p className="text-xs text-white/50">{c.category} · {c.modularUseCase}</p>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <Field label="Cost" value={money(c.costUsd)} />
                  <Field label="Retail" value={money(c.retailUsd)} />
                  <Field label="Lead time" value={`${c.leadTimeDays} days`} />
                  <Field label="Install" value={c.installComplexity} />
                  <Field label="Markets" value={c.countries.join(' · ')} />
                  <Field label="3D model" value="placeholder" />
                </div>
                <p className="mt-3 border-t border-white/10 pt-3 text-[11px] text-white/40">⚠ {c.complianceNote}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-sm text-white/50">Margins shown here are illustrative for partners. Customer-facing pricing only ever shows retail and bundle totals.</p>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-white/40">{label}</div>
      <div className="font-semibold capitalize text-white/90">{value}</div>
    </div>
  );
}

/* ----------------------- PARTNER ONBOARD ----------------------- */
function PartnerOnboard() {
  const [form, setForm] = useState({ name: '', type: 'designer', serviceArea: '', skills: '', email: '' });
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    addPartnerApp(form);
    addWaitlist({ email: form.email, kind: 'partner', meta: `${form.type} · ${form.serviceArea}` });
    setDone(true);
  }

  return (
    <section id="apply" className="container-page py-16">
      <div className="grid gap-10 rounded-3xl bg-brand-50/60 p-8 ring-1 ring-brand-100 sm:p-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeader eyebrow="Become a partner" title="Apply to the partner waitlist." subtitle="Tell us your service area and skills. We onboard partners market by market as we launch new cities." />
          <ul className="mt-6 space-y-3 text-sm text-ink-700/80">
            <li className="flex gap-2"><span className="text-accent-500">✓</span> Commission model: 0% for suppliers (margin in catalog), 10–13% project commission for service partners.</li>
            <li className="flex gap-2"><span className="text-accent-500">✓</span> Portfolio & service-area profile (placeholder upload).</li>
            <li className="flex gap-2"><span className="text-accent-500">✓</span> Project management preview included with Pro.</li>
          </ul>
        </div>
        <div className="card p-6">
          {done ? (
            <div className="grid h-full place-items-center py-10 text-center">
              <div>
                <div className="text-4xl">🤝</div>
                <h3 className="mt-3 text-xl font-bold text-ink-900">Application received</h3>
                <p className="mt-1 text-sm text-ink-700/70">We’ll reach out as we open your market. Check the operator console to see your application.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Company / name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Partner type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="designer">Designer</option>
                    <option value="contractor">Contractor</option>
                    <option value="installer">Installer</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="label">Service area</label>
                  <input className="input" value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} placeholder="City / region" />
                </div>
              </div>
              <div>
                <label className="label">Skills / categories</label>
                <input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. small-space, kitchen, staging" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <button className="btn-primary w-full">Apply to partner waitlist</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
