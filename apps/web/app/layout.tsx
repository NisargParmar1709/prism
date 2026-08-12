import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/lib/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prism — See your money clearly',
  description:
    'Track expenses, set budgets, and achieve savings goals. Built for Indian students.',
  keywords: ['expense tracker', 'budget', 'savings', 'finance', 'India', 'INR'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} light`}>
      <body className="min-h-screen bg-prism-white font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
