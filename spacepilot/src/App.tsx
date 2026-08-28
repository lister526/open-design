import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { Audit } from './pages/Audit';
import { Proposal } from './pages/Proposal';
import { Partners } from './pages/Partners';
import { Business } from './pages/Business';
import { Console } from './pages/Console';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

const HIDE_CHROME = ['/console'];

export default function App() {
  const { pathname } = useLocation();
  const hideChrome = HIDE_CHROME.some((p) => pathname.startsWith(p));

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollManager />
      {!hideChrome && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/proposal/:id" element={<Proposal />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/business" element={<Business />} />
          <Route path="/console/*" element={<Console />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}
