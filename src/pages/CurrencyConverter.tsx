import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Copy, Check, RefreshCw, WifiOff, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { COMMON_CURRENCIES, convertCurrency, fetchLiveRates, loadCachedRates, type CurrencyCache } from '../lib/currency';
import { addHistoryEntry } from '../lib/db';
import { formatNumber } from '../lib/mathEngine';

export default function CurrencyConverter() {
  const navigate = useNavigate();
  const [cache, setCache] = useState<CurrencyCache | null>(() => loadCachedRates());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('PKR');
  const [amount, setAmount] = useState('1');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const { cache: newCache, error: err } = await fetchLiveRates();
    if (newCache) setCache(newCache);
    if (err && err !== 'offline') setError(err);
    setLoading(false);
  };

  useEffect(() => { if (!cache) refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const numericAmount = parseFloat(amount);
  const result = useMemo(() => {
    if (!cache || Number.isNaN(numericAmount)) return null;
    return convertCurrency(numericAmount, from, to, cache.rates);
  }, [cache, numericAmount, from, to]);

  const swap = () => { setFrom(to); setTo(from); };

  const copyResult = async () => {
    if (result === null) return;
    try { await navigator.clipboard.writeText(formatNumber(result, 6)); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  const saveToHistory = async () => {
    if (result === null) return;
    await addHistoryEntry({
      expression: `${formatNumber(numericAmount)} ${from} → ${to}`,
      answer: formatNumber(result, 6),
      category: 'Currency',
      timestamp: Date.now(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const lastUpdated = cache ? new Date(cache.fetchedAtMs).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : null;

  const isShowingLive = online && cache && Date.now() - cache.fetchedAtMs < 1000 * 60 * 60 * 6 && !error;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><ArrowLeft size={18} /></button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Currency Converter</h1>
      </div>

      {!online && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
          <WifiOff size={18} className="shrink-0 mt-0.5" />
          <span>Offline Mode: Showing the last successfully updated exchange rates. These rates may not be current.</span>
        </div>
      )}
      {online && error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>Couldn't refresh rates ({error}). Showing the last cached rates{lastUpdated ? ` from ${lastUpdated}` : ''}.</span>
        </div>
      )}
      {!cache && !loading && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
          <span>No cached rates yet. An internet connection is required to download exchange rates for the first time.</span>
        </div>
      )}

      <div className="rounded-3xl bg-white dark:bg-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 p-5 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${isShowingLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-slate-500 dark:text-slate-400">{isShowingLive ? 'Live rates' : 'Cached rates'}{lastUpdated ? ` · updated ${lastUpdated}` : ''}</span>
          </div>
          <button onClick={refresh} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-100 dark:bg-slate-700 text-violet-700 dark:text-violet-300 text-xs font-semibold disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Rates
          </button>
        </div>

        <div className="flex gap-3 items-end mb-4">
          <div className="flex-1">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">From</span>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {COMMON_CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} – {c.name}</option>)}
            </select>
          </div>
          <button onClick={swap} className="mb-0.5 p-2.5 rounded-xl bg-violet-100 dark:bg-slate-700 text-violet-600 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-slate-600 transition-colors"><ArrowLeftRight size={18} /></button>
          <div className="flex-1">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">To</span>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {COMMON_CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} – {c.name}</option>)}
            </select>
          </div>
        </div>

        <label className="text-[11px] font-medium text-slate-400 block mb-1">Amount</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xl font-mono-num focus:outline-none focus:ring-2 focus:ring-violet-400 mb-4"
        />

        <div className="rounded-2xl bg-violet-50 dark:bg-slate-900 p-4 mb-4">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Result</div>
          <div className="font-mono-num text-2xl font-semibold text-violet-700 dark:text-violet-300 break-all">
            {result !== null ? `${formatNumber(result, 6)} ${to}` : cache ? 'Enter a valid amount' : '—'}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={copyResult} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {copied ? <Check size={15} /> : <Copy size={15} />} Copy Result
          </button>
          <button onClick={saveToHistory} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors">
            {saved ? <Check size={15} /> : <Save size={15} />} Save to History
          </button>
        </div>
      </div>
    </div>
  );
}
