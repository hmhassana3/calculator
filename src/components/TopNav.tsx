import { Calculator, Clock, Settings as SettingsIcon, Grid3x3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  onOpenModes: () => void;
}

export default function TopNav({ onOpenModes }: Props) {
  const location = useLocation();

  const navBtn = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-medium transition-colors ${
      active
        ? 'text-violet-600 dark:text-violet-400'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
    }`;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white">
            <Calculator size={17} />
          </span>
          <span className="hidden sm:inline tracking-tight">Calc+</span>
        </Link>
        <nav className="flex items-center gap-1">
          <button onClick={onOpenModes} className={navBtn(false)}>
            <Grid3x3 size={19} />
            <span>Modes</span>
          </button>
          <Link to="/history" className={navBtn(location.pathname === '/history')}>
            <Clock size={19} />
            <span>History</span>
          </Link>
          <Link to="/settings" className={navBtn(location.pathname === '/settings')}>
            <SettingsIcon size={19} />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
