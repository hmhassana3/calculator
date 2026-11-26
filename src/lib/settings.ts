export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  decimalPrecision: number;
  thousandsSeparator: boolean;
  haptic: boolean;
  sound: boolean;
  language: string;
  dateFormat: 'long' | 'short' | 'iso';
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  decimalPrecision: 10,
  thousandsSeparator: true,
  haptic: true,
  sound: false,
  language: 'en',
  dateFormat: 'long',
};

const SETTINGS_KEY = 'calc_app_settings';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function applyThousandsSeparator(numStr: string, enabled: boolean): string {
  if (!enabled) return numStr;
  const neg = numStr.startsWith('-');
  if (neg) numStr = numStr.slice(1);
  const [intPart, decPart] = numStr.split('.');
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + withSep + (decPart !== undefined ? '.' + decPart : '');
}

// Lightweight draft recovery (localStorage, not IndexedDB) per calculator mode.
export function saveDraft(mode: string, expression: string) {
  try {
    localStorage.setItem(`calc_draft_${mode}`, expression);
  } catch { /* ignore quota errors */ }
}

export function loadDraft(mode: string): string {
  try {
    return localStorage.getItem(`calc_draft_${mode}`) || '';
  } catch {
    return '';
  }
}

export function clearDraft(mode: string) {
  try {
    localStorage.removeItem(`calc_draft_${mode}`);
  } catch { /* ignore */ }
}

export const LANGUAGE_LOCALES: Record<string, string> = {
  en: 'en-US',
  'en-gb': 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  ar: 'ar-SA',
};

export function formatHistoryDate(
  ts: number,
  format: AppSettings['dateFormat'] = 'long',
  language = 'en'
): { date: string; time: string; dayName: string; year: number; monthName: string; dayOfMonth: number } {
  const locale = LANGUAGE_LOCALES[language] || 'en-US';
  const d = new Date(ts);
  const dayName = d.toLocaleDateString(locale, { weekday: 'long' });
  const monthName = d.toLocaleDateString(locale, { month: 'long' });
  const year = d.getFullYear();
  const dayOfMonth = d.getDate();
  let date: string;
  if (format === 'iso') date = d.toISOString().slice(0, 10);
  else if (format === 'short') date = d.toLocaleDateString(locale);
  else date = `${dayName}, ${dayOfMonth} ${monthName} ${year}`;
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return { date, time, dayName, year, monthName, dayOfMonth };
}
