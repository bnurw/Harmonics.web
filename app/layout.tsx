import type {Metadata} from 'next';
import { Roboto } from 'next/font/google';
import { AudioProvider } from '@/components/audio/AudioPlayerContext';
import './globals.css';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Harmonics — Audio & Messaging Platform',
  description: 'A pristine audio and messaging platform built with Next.js, TypeScript, and Tailwind CSS.',
  openGraph: {
    title: 'Harmonics — Audio & Messaging Platform',
    description: 'A pristine audio and messaging platform built with Next.js, TypeScript, and Tailwind CSS.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harmonics — Audio & Messaging Platform',
    description: 'A pristine audio and messaging platform built with Next.js, TypeScript, and Tailwind CSS.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={roboto.className}>
      <body className="bg-white text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white" suppressHydrationWarning>
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
