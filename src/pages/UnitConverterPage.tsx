import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftRight, Copy, Check, X, Search, ArrowLeft, Save } from 'lucide-react';
import { CATEGORIES, getCategory, type UnitDef } from '../lib/units';
import { addHistoryEntry } from '../lib/db';
import { formatNumber } from '../lib/mathEngine';

function UnitSelect({ units, value, onChange, label }: { units: UnitDef[]; value: string; onChange: (id: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = units.find((u) => u.id === value);
  const filtered = units.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.symbol.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative flex-1">
      <span className="text-[11px] font-medium text-slate-400 block mb-1">{label}</span>
      <button
        onClick={() => setOpen(true)}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-left flex items-center justify-between text-slate-700 dark:text-slate-200"
      >
        <span className="truncate">{selected ? `${selected.name} (${selected.symbol})` : 'Select unit'}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm mt-20 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{label}</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="relative mb-2">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search units..." className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none" />
            </div>
            <div className="overflow-y-auto flex-1 -mx-1 px-1">
              {filtered.map((u) => (
                <button key={u.id} onClick={() => { onChange(u.id); setOpen(false); setQuery(''); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm mb-1 ${u.id === value ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  {u.name} <span className="text-slate-400">({u.symbol})</span>
                </button>
              ))}
              {filtered.length === 0 && <div className="text-center text-sm text-slate-400 py-6">No units found</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnitConverterPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const cat = getCategory(category || '');
  const [from, setFrom] = useState(cat?.units[0]?.id || '');
  const [to, setTo] = useState(cat?.units[1]?.id || cat?.units[0]?.id || '');
  const [amount, setAmount] = useState('1');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (cat) { setFrom(cat.units[0].id); setTo(cat.units[1]?.id || cat.units[0].id); setAmount('1'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  if (!cat) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Unknown converter category.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold">Go Home</button>
      </div>
    );
  }

  const numericAmount = parseFloat(amount);
  const result = useMemo(() => {
    if (Number.isNaN(numericAmount)) return null;
    try { return cat.convert(numericAmount, from, to); } catch { return null; }
  }, [numericAmount, from, to, cat]);

  const swap = () => { setFrom(to); setTo(from); };
  const clear = () => setAmount('');
  const copyResult = async () => {
    if (result === null) return;
    try { await navigator.clipboard.writeText(formatNumber(result, 10)); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  const saveToHistory = async () => {
    if (result === null) return;
    const fromUnit = cat.units.find((u) => u.id === from)!;
    const toUnit = cat.units.find((u) => u.id === to)!;
    await addHistoryEntry({
      expression: `${formatNumber(numericAmount)} ${fromUnit.symbol} → ${toUnit.symbol}`,
      answer: formatNumber(result, 10),
      category: `Unit: ${cat.name}`,
      timestamp: Date.now(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><ArrowLeft size={18} /></button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{cat.name} Converter</h1>
      </div>

      <div className="flex flex-wrap gap-2 -mt-2">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => navigate(`/convert/${c.id}`)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${c.id === category ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{c.name}</button>
        ))}
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 p-5 sm:p-7">
        <div className="flex gap-3 items-end mb-4">
          <UnitSelect units={cat.units} value={from} onChange={setFrom} label="From" />
          <button onClick={swap} className="mb-0.5 p-2.5 rounded-xl bg-violet-100 dark:bg-slate-700 text-violet-600 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-slate-600 transition-colors"><ArrowLeftRight size={18} /></button>
          <UnitSelect units={cat.units} value={to} onChange={setTo} label="To" />
        </div>

        <label className="text-[11px] font-medium text-slate-400 block mb-1">Amount</label>
        <div className="relative mb-4">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="Enter value"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xl font-mono-num focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          {amount && (
            <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={18} /></button>
          )}
        </div>

        <div className="rounded-2xl bg-violet-50 dark:bg-slate-900 p-4 flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-medium text-slate-400 mb-1">Result</div>
            <div className="font-mono-num text-2xl font-semibold text-violet-700 dark:text-violet-300 break-all">
              {result !== null ? formatNumber(result, 10) : '—'}
            </div>
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
