// App.tsx
import React from 'react';
import Navigation from '@/navigation';
import { ThemeProvider } from '@/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}
