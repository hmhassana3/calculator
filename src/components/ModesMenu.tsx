import { AnimatePresence, motion } from 'framer-motion';
import { X, Divide as DivideIcon, Sigma, Ruler, CupSoda, Weight, Thermometer, Zap, Square, Gauge, Clock as ClockIcon, Bolt, HardDrive, CircleGauge, Triangle, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../lib/units';

interface Props {
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  ruler: Ruler, 'cup-soda': CupSoda, weight: Weight, thermometer: Thermometer, zap: Zap,
  square: Square, gauge: Gauge, clock: ClockIcon, bolt: Bolt, 'hard-drive': HardDrive,
  'gauge-circle': CircleGauge, triangle: Triangle,
};

export default function ModesMenu({ open, onClose }: Props) {
  const navigate = useNavigate();
  const go = (path: string) => { navigate(path); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="mt-0 sm:mt-10 w-full sm:max-w-2xl sm:rounded-3xl bg-white dark:bg-slate-900 min-h-full sm:min-h-0 shadow-2xl p-5 sm:p-7"
            initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Calculator Modes</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Calculators</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => go('/')} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors text-left">
                <span className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center"><DivideIcon size={18} /></span>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Standard</div>
                  <div className="text-xs text-slate-400">Everyday arithmetic</div>
                </div>
              </button>
              <button onClick={() => go('/scientific')} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors text-left">
                <span className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center"><Sigma size={18} /></span>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Scientific</div>
                  <div className="text-xs text-slate-400">Advanced math & tools</div>
                </div>
              </button>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Unit Converter</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              <button onClick={() => go('/convert/currency')} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center"><Banknote size={16} /></span>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 text-center">Currency</span>
              </button>
              {CATEGORIES.map((c) => {
                const Icon = iconMap[c.icon] || Ruler;
                return (
                  <button key={c.id} onClick={() => go(`/convert/${c.id}`)} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors">
                    <span className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center"><Icon size={16} /></span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 text-center">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
