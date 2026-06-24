import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'SpacePilot AI — Turn room refresh into paid, profitable projects',
  description:
    'The operating system that turns room refresh into paid, profitable projects in under 15 minutes for short-term rental landlords, operators and designers.',
};

const noFlash = `(function(){try{var s=JSON.parse(localStorage.getItem('spacepilot.prefs')||'{}').state||{};if(s.theme==='dark')document.documentElement.classList.add('dark');if(s.locale){document.documentElement.lang=s.locale;if(s.locale==='ar')document.documentElement.dir='rtl';}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%232f6bff'/%3E%3Cpath d='M12 5l6 3.5v7L12 19l-6-3.5v-7L12 5z' fill='white'/%3E%3C/svg%3E"
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
