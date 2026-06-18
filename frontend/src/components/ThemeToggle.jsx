import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const STORAGE_KEY = 'theme_mode'; // 'warm' | 'dark' (default dark)

const applyTheme = (mode) => {
  const html = document.documentElement;
  if (mode === 'warm') {
    html.classList.add('warm-mode');
  } else {
    html.classList.remove('warm-mode');
  }
};

const ThemeToggle = () => {
  const [mode, setMode] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved === 'warm' ? 'warm' : 'dark';
    setMode(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next = mode === 'warm' ? 'dark' : 'warm';
    setMode(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === 'warm' ? 'Switch to night mode' : 'Switch to warm light mode'}
      title={mode === 'warm' ? 'Night mode (slate & gold)' : 'Warm light mode (cream & amber)'}
      data-testid="theme-toggle"
      className="w-10 h-10 rounded-full flex items-center justify-center border border-amber-500/30 hover:border-amber-400 transition-all bg-slate-900/40 hover:bg-amber-500/10 text-amber-400 ml-2"
    >
      {mode === 'warm' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

export default ThemeToggle;
