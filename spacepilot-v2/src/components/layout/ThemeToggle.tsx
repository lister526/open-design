'use client';
import { Moon, Sun } from 'lucide-react';
import { usePrefs } from '@/store/prefs';

export function ThemeToggle() {
  const { theme, toggleTheme } = usePrefs();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground transition hover:bg-muted"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
