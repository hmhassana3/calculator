import type { ReactNode } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface Props {
  children: ReactNode;
  onClick: () => void;
  variant?: 'digit' | 'op' | 'func' | 'equals' | 'accent' | 'muted' | 'toggleActive';
  className?: string;
  span?: number;
  title?: string;
  small?: boolean;
}

const variantClasses: Record<string, string> = {
  digit: 'bg-white/80 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95',
  op: 'bg-violet-100 dark:bg-slate-700 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-slate-600 active:scale-95',
  func: 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95',
  equals: 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 active:scale-95 shadow-lg shadow-violet-600/30',
  accent: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900 active:scale-95',
  muted: 'bg-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
  toggleActive: 'bg-violet-600 text-white shadow shadow-violet-600/30',
};

export default function CalcButton({ children, onClick, variant = 'digit', className = '', span, title, small }: Props) {
  const { vibrate } = useSettings();
  return (
    <button
      type="button"
      title={title}
      onClick={() => { vibrate(); onClick(); }}
      className={`select-none rounded-2xl font-medium transition-all duration-100 flex items-center justify-center ${small ? 'text-xs sm:text-sm py-2' : 'text-lg sm:text-xl py-3.5 sm:py-4'} ${variantClasses[variant]} ${span ? `col-span-${span}` : ''} ${className}`}
      style={span ? { gridColumn: `span ${span} / span ${span}` } : undefined}
    >
      {children}
    </button>
  );
}
