import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trash2, Search, CheckSquare, Square } from 'lucide-react';
import { getAllTrash, restoreFromTrash, permanentlyDelete, emptyTrash, purgeExpiredTrash, retentionDaysLeft, type TrashEntry } from '../lib/db';
import { formatHistoryDate } from '../lib/settings';
import { useSettings } from '../contexts/SettingsContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function TrashPage() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TrashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);
  const [confirmDeleteOne, setConfirmDeleteOne] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      await purgeExpiredTrash();
      setEntries(await getAllTrash());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const enriched = useMemo(
    () => entries.map((e) => ({ ...e, meta: formatHistoryDate(e.timestamp, settings.dateFormat, settings.language), daysLeft: retentionDaysLeft(e.deletedAt) })),
    [entries, settings.dateFormat, settings.language]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter((e) =>
      e.expression.toLowerCase().includes(q) ||
      e.answer.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.meta.date.toLowerCase().includes(q)
    );
  }, [enriched, query]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const restoreOne = async (id: number) => { await restoreFromTrash([id]); load(); };
  const restoreAll = async () => { await restoreFromTrash(entries.map((e) => e.id!)); setSelected(new Set()); load(); };
  const deleteOne = async () => { if (confirmDeleteOne !== null) { await permanentlyDelete([confirmDeleteOne]); setConfirmDeleteOne(null); load(); } };
  const deleteSelected = async () => { await permanentlyDelete(Array.from(selected)); setSelected(new Set()); setConfirmDeleteSelected(false); load(); };
  const doEmptyTrash = async () => { await emptyTrash(); setConfirmEmpty(false); setSelected(new Set()); load(); };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trash</h1>
      </div>
      <p className="text-xs text-slate-400 -mt-3">Deleted records are kept for 30 days before being permanently removed.</p>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search deleted records..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{filtered.length} record{filtered.length === 1 ? '' : 's'} in trash</span>
        <div className="flex gap-3">
          {selected.size > 0 && (
            <button onClick={() => setConfirmDeleteSelected(true)} className="font-semibold text-rose-600 dark:text-rose-400">Delete {selected.size} Permanently</button>
          )}
          {entries.length > 0 && (
            <>
              <button onClick={restoreAll} className="font-semibold text-violet-600 dark:text-violet-400">Restore All</button>
              <button onClick={() => setConfirmEmpty(true)} className="font-semibold text-rose-600 dark:text-rose-400">Empty Trash</button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading trash…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">{entries.length === 0 ? 'Trash is empty.' : 'No results match your search.'}</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((entry) => (
            <div key={entry.id} className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-4 flex gap-3">
              <button onClick={() => toggleSelect(entry.id!)} className="mt-0.5 text-slate-300 dark:text-slate-600 hover:text-violet-500 shrink-0">
                {selected.has(entry.id!) ? <CheckSquare size={18} className="text-violet-600" /> : <Square size={18} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">{entry.category}</span>
                  <span className="text-[11px] text-slate-400">Deleted {entry.meta.date} · {entry.meta.time}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">{entry.daysLeft}d left</span>
                </div>
                <div className="font-mono-num text-sm text-slate-500 dark:text-slate-400 truncate">{entry.expression}</div>
                <div className="font-mono-num text-lg font-semibold text-slate-800 dark:text-slate-100 break-all">= {entry.answer}</div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => restoreOne(entry.id!)} title="Restore" className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-700">
                  <RotateCcw size={15} />
                </button>
                <button onClick={() => setConfirmDeleteOne(entry.id!)} title="Delete permanently" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={confirmEmpty} title="Empty Trash?" message="All records in Trash will be permanently deleted immediately. This cannot be undone." confirmLabel="Empty Trash" onConfirm={doEmptyTrash} onCancel={() => setConfirmEmpty(false)} />
      <ConfirmDialog open={confirmDeleteSelected} title={`Permanently delete ${selected.size} record${selected.size === 1 ? '' : 's'}?`} message="This action cannot be undone." confirmLabel="Delete Permanently" onConfirm={deleteSelected} onCancel={() => setConfirmDeleteSelected(false)} />
      <ConfirmDialog open={confirmDeleteOne !== null} title="Permanently delete this record?" message="This action cannot be undone." confirmLabel="Delete Permanently" onConfirm={deleteOne} onCancel={() => setConfirmDeleteOne(null)} />
    </div>
  );
}
