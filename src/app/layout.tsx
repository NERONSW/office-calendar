import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Office Chores - Outlook Style Calendar',
  description: 'Manage, schedule, and assign office chores with an Outlook-style week view calendar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased select-none">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
