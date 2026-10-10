import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import { useSettings } from '../context/SettingsContext';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useSettings();
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
          <button className="icon-btn lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="flex-1" />
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle dark/light mode">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
