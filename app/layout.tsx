import type { Metadata, Viewport } from 'next';
import { Nunito, DM_Mono } from 'next/font/google';
import './globals.css';

/*
  Typography per DW's brand kit (Material Design 3 foundation):
    - Nunito for both display and body — full Cyrillic, slightly rounded forms
      that feel friendly without crossing into childish. Weights 400/500/600/700/800.
    - DM Mono for screen labels, angle readouts (θᵢ = 35°), and stat tickers.
*/
const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Mazy — Физик · Гэрэл',
  description:
    'Бичил сургалтын апп — гэрлийн физикийг 9–10-р ангийн сурагчдад зориулав.',
  applicationName: 'Mazy',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FCEDA0', // brand-100, matches the Splash + Home hero card
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className={`${nunito.variable} ${dmMono.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-dvh bg-cream-50 text-ink-900 font-body antialiased">
        {/*
          Mobile-first: max-width 480px keeps reading width comfortable on
          tablet/desktop while preserving the iPhone 14-class composition the
          hi-fi was designed against (390×844).
        */}
        <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-paper shadow-2xl border-x border-ink-300/20 relative overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
