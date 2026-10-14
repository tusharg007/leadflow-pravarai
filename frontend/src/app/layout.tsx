import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import './globals.css';

const inter = localFont({ src: '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', variable: '--font-inter', display: 'swap' });
export const metadata: Metadata = { title: 'LeadFlow', description: 'Track leads, discussions, and follow-ups.' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body className={`${inter.variable} antialiased`}><Providers>{children}</Providers></body></html>;
}
