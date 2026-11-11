import type { Metadata } from 'next';
import { Newsreader, Public_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import Nav from '@/components/nav';
import Footer from '@/components/footer';
import Analytics from '@/components/analytics';

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Accepted! | Ontario Supp App Hub & Community',
    template: '%s · Accepted!',
  },
  description:
    'Plan Ontario university applications, browse supplemental-program references, practise interview and writing prompts, and get direct feedback.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${publicSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
