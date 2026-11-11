<<<<<<< HEAD
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
=======
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import AppShell from "@/components/app-shell";
import Analytics from "@/components/analytics";

const fraunces = localFont({
  src: "./fonts/fraunces-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
});

const jbMono = localFont({
  src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  style: "normal",
  variable: "--font-jbmono",
  display: "swap",
>>>>>>> pr/8
});

export const metadata: Metadata = {
  title: {
    default: "Accepted! | Ontario Supp App Hub & Community",
    template: "%s · Accepted!",
  },
  description:
    "Plan Ontario university applications, browse supplemental-program references, practise interview and writing prompts, and get direct feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
<<<<<<< HEAD
    <html lang="en" className={`${newsreader.variable} ${publicSans.variable}`}>
=======
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jbMono.variable}`}
    >
>>>>>>> pr/8
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
