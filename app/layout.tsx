import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import AppShell from '@/components/app-shell';
import Analytics from '@/components/analytics';

// Self-hosted variable fonts (Fraunces opsz+wght, Inter, JetBrains Mono), as in the reference build.
const fraunces = localFont({ src: './fonts/fraunces.woff2', variable: '--font-fraunces', weight: '100 900', display: 'swap' });
const inter = localFont({ src: './fonts/inter.woff2', variable: '--font-inter', weight: '100 900', display: 'swap' });
const jbmono = localFont({ src: './fonts/jbmono.woff2', variable: '--font-jbmono', weight: '100 800', display: 'swap' });

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
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jbmono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
