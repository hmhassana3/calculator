export interface CurrencyCache {
  base: string;
  rates: Record<string, number>;
  fetchedAtISO: string;
  fetchedAtMs: number;
}

const CACHE_KEY = 'calc_currency_cache';
const API_URL = 'https://open.er-api.com/v6/latest/USD';

export const COMMON_CURRENCIES: { code: string; name: string }[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'PLN', name: 'Polish Zloty' },
];

export function loadCachedRates(): CurrencyCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCachedRates(cache: CurrencyCache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function fetchLiveRates(): Promise<{ cache: CurrencyCache | null; error: string | null }> {
  if (!navigator.onLine) {
    return { cache: loadCachedRates(), error: 'offline' };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    if (data.result !== 'success' || !data.rates) throw new Error('Invalid API response');
    const cache: CurrencyCache = {
      base: data.base_code || 'USD',
      rates: data.rates,
      fetchedAtISO: new Date().toISOString(),
      fetchedAtMs: Date.now(),
    };
    saveCachedRates(cache);
    return { cache, error: null };
  } catch (err: any) {
    const cached = loadCachedRates();
    return { cache: cached, error: err?.message || 'Network error' };
  }
}

export function convertCurrency(amount: number, from: string, to: string, rates: Record<string, number>): number | null {
  if (!rates[from] || !rates[to]) return null;
  const usd = amount / rates[from];
  return usd * rates[to];
}
