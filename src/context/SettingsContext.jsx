import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LS_KEYS } from '../utils/storage';

const defaults = { theme: 'dark', currency: '₹' };
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage(LS_KEYS.settings, defaults);
  const merged = { ...defaults, ...settings };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', merged.theme === 'dark');
  }, [merged.theme]);

  const update = (patch) => setSettings((s) => ({ ...defaults, ...s, ...patch }));
  const toggleTheme = () => update({ theme: merged.theme === 'dark' ? 'light' : 'dark' });

  return (
    <SettingsContext.Provider value={{ ...merged, update, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
