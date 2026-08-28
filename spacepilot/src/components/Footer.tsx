import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Logo } from './Logo';
import { addWaitlist } from '../lib/store';

export function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    addWaitlist({ email, kind: 'newsletter' });
    setDone(true);
    setEmail('');
  }

  return (
    <footer className="mt-24 border-t border-ink-900/[.06] bg-ink-950 text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <div className="[&_*]:!text-white">
            <span className="inline-flex items-center gap-2">
              <Logo />
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            The AI space transaction OS. From room scan to a profitable, buildable redesign proposal — localized, priced and delivered.
          </p>
          <p className="mt-4 text-xs text-white/40">© {new Date().getFullYear()} SpacePilot AI. Estimates are scenario-based and subject to local conditions.</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">Product</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/audit" className="hover:text-white">AI Room Audit</Link></li>
            <li><a href="/#pricing" className="hover:text-white">Pricing</a></li>
            <li><a href="/#use-cases" className="hover:text-white">Use cases</a></li>
            <li><Link to="/console" className="hover:text-white">Operator console</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">Partners</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/partners" className="hover:text-white">Designer / Contractor</Link></li>
            <li><Link to="/partners" className="hover:text-white">Supplier catalog</Link></li>
            <li><Link to="/business" className="hover:text-white">Business model</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">City launch & updates</p>
          <p className="mb-3 text-sm text-white/60">Join the waitlist for new city launches and supplier onboarding.</p>
          {done ? (
            <p className="rounded-xl bg-accent-500/15 px-4 py-3 text-sm font-semibold text-accent-400">You’re on the list. We’ll be in touch.</p>
          ) : (
            <form onSubmit={subscribe} className="flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 ring-1 ring-white/15 focus:ring-2 focus:ring-brand-400 outline-none"
              />
              <button className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold hover:bg-brand-400 transition">Join</button>
            </form>
          )}
        </div>
      </div>
    </footer>
  );
}
