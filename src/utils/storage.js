export const LS_KEYS = {
  settings: 'td.settings',
  tasks: 'td.tasks',
  pages: 'td.pages',
  sidebar: 'td.sidebarCollapsed',
  risk: 'td.riskCalc',
};

export function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export const uid = () =>
  (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
