'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ChoreProvider } from '@/context/ChoreContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ChoreProvider>{children}</ChoreProvider>
    </NextThemesProvider>
  );
}
