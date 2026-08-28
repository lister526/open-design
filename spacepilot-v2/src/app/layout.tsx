import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'SpacePilot — AI Listing Revenue Upgrade OS for short-term rentals',
  description:
    'SpacePilot diagnoses why your Airbnb / Vrbo / serviced-apartment listing is under-earning, then turns the highest-ROI room fixes into a shoppable upgrade kit, executable quote and photo-ready delivery. Scenario-based estimates only.',
};

const noFlash = `(function(){try{var s=JSON.parse(localStorage.getItem('spacepilot.prefs')||'{}').state||{};if(s.theme==='dark')document.documentElement.classList.add('dark');if(s.locale){document.documentElement.lang=s.locale;if(s.locale==='ar')document.documentElement.dir='rtl';}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%232a1f18'/%3E%3Cpath d='M12 5l6 3.5v7L12 19l-6-3.5v-7L12 5z' fill='%23c2783f'/%3E%3C/svg%3E"
        />
      </head>
      <body className={`${inter.variable} ${fraunces.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
