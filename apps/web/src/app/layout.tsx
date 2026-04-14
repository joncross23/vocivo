import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vocivo',
  description: 'Spanish vocabulary mastery built around one shared learner system.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
