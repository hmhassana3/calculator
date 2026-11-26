import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Copy, RotateCcw, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { getAllHistory, moveToTrash, type HistoryEntry } from '../lib/db';
import { formatHistoryDate, saveDraft } from '../lib/settings';
import { useSettings } from '../contexts/SettingsContext';
import ConfirmDialog from '../components/ConfirmDialog';

type FilterField = 'all' | 'calculation' | 'year' | 'month' | 'date' | 'day' | 'category' | 'result';

const FILTER_LABELS: Record<FilterField, string> = {
  all: 'All Search', calculation: 'Calculation', year: 'Year', month: 'Month', date: 'Date', day: 'Day', category: 'Category', result: 'Result',
};

export default function HistoryPage() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [field, setField] = useState<FilterField>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmClearSelected, setConfirmClearSelected] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try { setEntries(await getAllHistory()); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const enriched = useMemo(
    () => entries.map((e) => ({ ...e, meta: formatHistoryDate(e.timestamp, settings.dateFormat, settings.language) })),
    [entries, settings.dateFormat, settings.language]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter((e) => {
      const { meta } = e;
      switch (field) {
        case 'calculation': return e.expression.toLowerCase().includes(q);
        case 'year': return String(meta.year).includes(q);
        case 'month': return meta.monthName.toLowerCase().includes(q);
        case 'date': return String(meta.dayOfMonth).includes(q);
        case 'day': return meta.dayName.toLowerCase().includes(q);
        case 'category': return e.category.toLowerCase().includes(q);
        case 'result': return e.answer.toLowerCase().includes(q);
        default:
          return (
            e.expression.toLowerCase().includes(q) ||
            e.answer.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            meta.date.toLowerCase().includes(q) ||
            meta.dayName.toLowerCase().includes(q) ||
            meta.monthName.toLowerCase().includes(q) ||
            String(meta.year).includes(q) ||
            String(meta.dayOfMonth).includes(q) ||
            meta.time.toLowerCase().includes(q)
          );
      }
    });
  }, [enriched, query, field]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const reuse = (entry: HistoryEntry) => {
    const expr = entry.expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (entry.category === 'Standard') { saveDraft('standard', expr); navigate('/'); }
    else if (entry.category === 'Scientific') { saveDraft('scientific', expr); navigate('/scientific'); }
  };

  const copyEntry = async (entry: HistoryEntry) => {
    try {
      await navigator.clipboard.writeText(`${entry.expression} = ${entry.answer}`);
      setCopiedId(entry.id!);
      setTimeout(() => setCopiedId(null), 1200);
    } catch { /* ignore */ }
  };

  const deleteSingle = async (id: number) => { await moveToTrash([id]); load(); };

  const clearSelected = async () => {
    await moveToTrash(Array.from(selected));
    setSelected(new Set());
    setConfirmClearSelected(false);
    load();
  };

  const clearAll = async () => {
    await moveToTrash(entries.map((e) => e.id!));
    setConfirmClearAll(false);
    setSelected(new Set());
    load();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Calculation History</h1>
        <button onClick={() => navigate('/trash')} className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline">View Trash</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${FILTER_LABELS[field].toLowerCase()}...`}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div className="relative">
          <select value={field} onChange={(e) => setField(e.target.value as FilterField)} className="appearance-none w-full sm:w-44 pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {(Object.keys(FILTER_LABELS) as FilterField[]).map((f) => <option key={f} value={f}>{FILTER_LABELS[f]}</option>)}
          </select>
          <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{filtered.length} matching result{filtered.length === 1 ? '' : 's'}{query ? ` for "${query}"` : ''}</span>
        <div className="flex gap-3">
          {selected.size > 0 && (
            <button onClick={() => setConfirmClearSelected(true)} className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1"><Trash2 size={13} /> Delete {selected.size}</button>
          )}
          {entries.length > 0 && (
            <button onClick={() => setConfirmClearAll(true)} className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1"><Trash2 size={13} /> Clear All</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading history…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          {entries.length === 0 ? 'No calculations yet. Start calculating and your history will appear here.' : 'No results match your search.'}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((entry) => (
            <div key={entry.id} className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-4 flex gap-3">
              <button onClick={() => toggleSelect(entry.id!)} className="mt-0.5 text-slate-300 dark:text-slate-600 hover:text-violet-500 shrink-0">
                {selected.has(entry.id!) ? <CheckSquare size={18} className="text-violet-600" /> : <Square size={18} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300">{entry.category}</span>
                  <span className="text-[11px] text-slate-400">{entry.meta.date} · {entry.meta.time}</span>
                </div>
                <div className="font-mono-num text-sm text-slate-500 dark:text-slate-400 truncate">{entry.expression}</div>
                <div className="font-mono-num text-lg font-semibold text-slate-800 dark:text-slate-100 break-all">= {entry.answer}</div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => copyEntry(entry)} title="Copy" className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-700">
                  <Copy size={15} className={copiedId === entry.id ? 'text-emerald-500' : ''} />
                </button>
                {(entry.category === 'Standard' || entry.category === 'Scientific') && (
                  <button onClick={() => reuse(entry)} title="Reuse this calculation" className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-700">
                    <RotateCcw size={15} />
                  </button>
                )}
                <button onClick={() => deleteSingle(entry.id!)} title="Move to Trash" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmClearAll}
        title="Clear all history?"
        message="All history records will be moved to Trash. You can restore them within 30 days before they are permanently deleted."
        confirmLabel="Move to Trash"
        onConfirm={clearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
      <ConfirmDialog
        open={confirmClearSelected}
        title={`Delete ${selected.size} selected record${selected.size === 1 ? '' : 's'}?`}
        message="Selected records will be moved to Trash and can be restored within 30 days."
        confirmLabel="Move to Trash"
        onConfirm={clearSelected}
        onCancel={() => setConfirmClearSelected(false)}
      />
    </div>
  );
}
