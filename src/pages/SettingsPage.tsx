import { useRef, useState } from 'react';
import { Sun, Moon, Monitor, Download, Upload, Trash2, Info, ShieldCheck, Vibrate, Volume2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { getAllHistory, getAllTrash, addHistoryEntry, clearAllHistoryToTrash } from '../lib/db';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ThemeMode } from '../lib/settings';

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-5">
    <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-4">{title}</h2>
    {children}
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-2.5 gap-3">
    <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
    {children}
  </div>
);

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const exportHistory = async () => {
    const history = await getAllHistory();
    const trash = await getAllTrash();
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), history, trash }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculator-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('History exported successfully.');
    setTimeout(() => setStatus(null), 2500);
  };

  const importHistory = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const items = Array.isArray(data.history) ? data.history : Array.isArray(data) ? data : [];
      for (const item of items) {
        if (item.expression && item.answer) {
          await addHistoryEntry({ expression: item.expression, answer: item.answer, category: item.category || 'Standard', timestamp: item.timestamp || Date.now() });
        }
      }
      setStatus(`Imported ${items.length} record${items.length === 1 ? '' : 's'} successfully.`);
    } catch {
      setStatus('Import failed: invalid file format.');
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const themeOptions: { id: ThemeMode; icon: any; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
      {status && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm">{status}</div>}

      <SectionCard title="Appearance">
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => updateSettings({ theme: id })} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors ${settings.theme === id ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Number Formatting">
        <Row label="Decimal precision">
          <select value={settings.decimalPrecision} onChange={(e) => updateSettings({ decimalPrecision: Number(e.target.value) })} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
            {[4, 6, 8, 10, 12, 14].map((p) => <option key={p} value={p}>{p} digits</option>)}
          </select>
        </Row>
        <Row label="Thousands separator (1,000)">
          <Toggle checked={settings.thousandsSeparator} onChange={(v) => updateSettings({ thousandsSeparator: v })} />
        </Row>
        <Row label="Date format">
          <select value={settings.dateFormat} onChange={(e) => updateSettings({ dateFormat: e.target.value as any })} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
            <option value="long">Weekday, Day Month Year</option>
            <option value="short">Short (locale)</option>
            <option value="iso">ISO (YYYY-MM-DD)</option>
          </select>
        </Row>
        <Row label="Language / Date locale">
          <select value={settings.language} onChange={(e) => updateSettings({ language: e.target.value })} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
            <option value="en">English (US)</option>
            <option value="en-gb">English (UK)</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="ar">العربية</option>
          </select>
        </Row>
      </SectionCard>

      <SectionCard title="Feedback">
        <Row label={<span className="flex items-center gap-2"><Vibrate size={15} /> Haptic feedback</span> as any}>
          <Toggle checked={settings.haptic} onChange={(v) => updateSettings({ haptic: v })} />
        </Row>
        <Row label={<span className="flex items-center gap-2"><Volume2 size={15} /> Button sounds</span> as any}>
          <Toggle checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} />
        </Row>
      </SectionCard>

      <SectionCard title="History Data">
        <div className="flex flex-col gap-2.5">
          <button onClick={exportHistory} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">
            <Download size={15} /> Export History (JSON)
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">
            <Upload size={15} /> Import History (JSON)
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importHistory(f); e.target.value = ''; }} />
          <button onClick={() => setConfirmClear(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60">
            <Trash2 size={15} /> Clear All History
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Privacy & About">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All calculations, history and settings are stored locally on your device using IndexedDB and localStorage — nothing is uploaded to a server.
            The only network request this app ever makes is fetching public currency exchange rates for the Currency Converter.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Info size={18} className="text-violet-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Calc+ is a premium all-in-one calculator: standard & scientific calculators, 12 unit conversion categories, live currency
            conversion with offline caching, persistent searchable history, and a 30-day recycle bin. Installable as an offline-ready PWA.
          </p>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all history?"
        message="All history will be moved to Trash and can be restored within 30 days."
        confirmLabel="Move to Trash"
        onConfirm={async () => { await clearAllHistoryToTrash(); setConfirmClear(false); setStatus('History cleared (moved to Trash).'); setTimeout(() => setStatus(null), 2500); }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
