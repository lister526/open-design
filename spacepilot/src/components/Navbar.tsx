import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { LocaleSwitcher } from './LocaleSwitcher';
import { useLocale } from '../context/LocaleContext';

export function Navbar() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: '/#product', label: t('nav.product') },
    { to: '/#use-cases', label: t('nav.useCases') },
    { to: '/#pricing', label: t('nav.pricing') },
    { to: '/partners', label: t('nav.partners') },
    { to: '/business', label: t('nav.business') },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/[.06] bg-white/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0"><Logo /></Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.to.startsWith('/#') ? (
              <a key={l.to} href={l.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-900/[.04] transition">
                {l.label}
              </a>
            ) : (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-ink-900/[.04] ${isActive ? 'text-brand-700' : 'text-ink-700 hover:text-ink-900'}`}>
                {l.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/console" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 sm:inline-flex">
            {t('nav.console')}
          </Link>
          <LocaleSwitcher />
          <button onClick={() => navigate('/audit')} className="btn-primary !px-4 !py-2 text-sm">
            {t('nav.audit')}
          </button>
          <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-lg ring-1 ring-ink-900/10 lg:hidden" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" /></svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-900/[.06] bg-white px-5 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a key={l.to} href={l.to.startsWith('/#') ? l.to : undefined} onClick={() => { setOpen(false); if (!l.to.startsWith('/#')) navigate(l.to); }} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-900/[.04]">
                {l.label}
              </a>
            ))}
            <Link to="/console" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-900/[.04]">
              {t('nav.console')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
