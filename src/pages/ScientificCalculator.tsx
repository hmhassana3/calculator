import { useEffect, useState } from 'react';
import { Delete, Copy, Share2, Check, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import CalcButton from '../components/CalcButton';
import { evaluateExpression, formatNumber, safePreview, autoCloseParens, type AngleMode } from '../lib/mathEngine';
import { addHistoryEntry } from '../lib/db';
import { saveDraft, loadDraft, clearDraft, applyThousandsSeparator } from '../lib/settings';
import { useSettings } from '../contexts/SettingsContext';
import AdvancedTools from '../components/scientific/AdvancedTools';

function prettify(expr: string): string {
  return expr.replace(/\*/g, '×').replace(/\//g, '÷');
}

export default function ScientificCalculator() {
  const { settings } = useSettings();
  const [expr, setExpr] = useState<string>(() => loadDraft('scientific'));
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [angleMode, setAngleMode] = useState<AngleMode>(() => (localStorage.getItem('calc_angle_mode') as AngleMode) || 'deg');
  const [second, setSecond] = useState(false);
  const [hyp, setHyp] = useState(false);
  const [memory, setMemory] = useState<number>(() => parseFloat(localStorage.getItem('calc_memory') || '0') || 0);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => { saveDraft('scientific', expr); }, [expr]);
  useEffect(() => { localStorage.setItem('calc_angle_mode', angleMode); }, [angleMode]);
  useEffect(() => { localStorage.setItem('calc_memory', String(memory)); }, [memory]);

  const preview = safePreview(expr, { angleMode, memory });
  const prettyExpr = prettify(expr);

  const append = (s: string) => { setJustEvaluated(false); setExpr((p) => p + s); };
  const handleDigit = (d: string) => {
    if (justEvaluated) { setExpr(d === '.' ? '0.' : d); setJustEvaluated(false); return; }
    append(d);
  };
  const handleOperator = (op: string) => {
    if (justEvaluated) setJustEvaluated(false);
    setExpr((p) => p + op);
  };
  const wrapPrefix = (fn: string) => {
    setJustEvaluated(false);
    setExpr((p) => `${fn}(${p})`);
  };
  const wrapSuffix = (suffix: string) => {
    setJustEvaluated(false);
    setExpr((p) => (p ? `(${p})${suffix}` : p));
  };
  const handleClear = () => { setExpr(''); setJustEvaluated(false); clearDraft('scientific'); };
  const handleBackspace = () => { setJustEvaluated(false); setExpr((p) => p.slice(0, -1)); };
  const handleSign = () => {
    setExpr((prev) => {
      const m = prev.match(/(-?\d+\.?\d*)$/);
      if (!m) return prev;
      const num = m[1];
      const start = prev.length - num.length;
      const toggled = num.startsWith('-') ? num.slice(1) : `-${num}`;
      return prev.slice(0, start) + toggled;
    });
  };

  const trigName = (base: string) => {
    let name = base;
    if (hyp) name += 'h';
    if (second) name = 'a' + name;
    return name;
  };

  const handleEquals = async () => {
    const closed = autoCloseParens(expr);
    try {
      const result = evaluateExpression(closed, { angleMode, memory });
      const formatted = formatNumber(result, settings.decimalPrecision);
      await addHistoryEntry({ expression: prettyExpr, answer: applyThousandsSeparator(formatted, settings.thousandsSeparator), category: 'Scientific', timestamp: Date.now() });
      setExpr(formatted);
      setJustEvaluated(true);
      clearDraft('scientific');
    } catch {
      setExpr('Error');
      setJustEvaluated(true);
    }
  };

  const getCurrentValue = (): number | null => {
    try { return evaluateExpression(autoCloseParens(expr), { angleMode, memory }); } catch { return null; }
  };

  const copyResult = async () => {
    const val = preview || expr;
    try { await navigator.clipboard.writeText(val); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  const shareResult = async () => {
    const text = `${prettyExpr} = ${preview || expr}`;
    if (navigator.share) { try { await navigator.share({ text }); } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (/[0-9.]/.test(e.key)) { handleDigit(e.key); return; }
      if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '^') { handleOperator(e.key); return; }
      if (e.key === '(' || e.key === ')') { append(e.key); return; }
      if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); handleEquals(); return; }
      if (e.key === 'Backspace') { handleBackspace(); return; }
      if (e.key === 'Escape') { handleClear(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const toggleBtnClass = (active: boolean) =>
    `text-[11px] sm:text-xs font-semibold rounded-xl py-2.5 transition-colors ${active ? 'bg-violet-600 text-white shadow shadow-violet-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-white dark:bg-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 p-5 sm:p-6 min-h-[150px] flex flex-col justify-end">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1.5 text-[10px] font-semibold text-slate-400">
            <span className={`px-2 py-0.5 rounded-full ${angleMode === 'deg' ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300' : ''}`}>{angleMode.toUpperCase()}</span>
            {second && <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">2nd</span>}
            {hyp && <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300">HYP</span>}
            {memory !== 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">M</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={copyResult} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors" title="Copy result">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button onClick={shareResult} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors" title="Share calculation">
              <Share2 size={16} />
            </button>
          </div>
        </div>
        <div className="font-mono-num text-xl sm:text-3xl font-light text-right text-slate-800 dark:text-slate-100 break-all leading-tight">
          {prettyExpr || '0'}
        </div>
        <div className="font-mono-num text-sm sm:text-base font-light text-right text-slate-400 dark:text-slate-500 mt-2 h-6">
          {!justEvaluated && preview !== null && preview !== prettyExpr ? `= ${applyThousandsSeparator(preview, settings.thousandsSeparator)}` : ' '}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <button onClick={() => setSecond((v) => !v)} className={toggleBtnClass(second)}>2nd</button>
        <button onClick={() => setAngleMode((m) => (m === 'deg' ? 'rad' : 'deg'))} className={toggleBtnClass(false)}>{angleMode === 'deg' ? 'DEG' : 'RAD'}</button>
        <button onClick={() => setHyp((v) => !v)} className={toggleBtnClass(hyp)}>Hyp</button>
        <button onClick={() => append('(')} className={toggleBtnClass(false)}>(</button>
        <button onClick={() => append(')')} className={toggleBtnClass(false)}>)</button>

        <button onClick={() => wrapPrefix(trigName('sin'))} className={toggleBtnClass(false)}>{trigName('sin')}</button>
        <button onClick={() => wrapPrefix(trigName('cos'))} className={toggleBtnClass(false)}>{trigName('cos')}</button>
        <button onClick={() => wrapPrefix(trigName('tan'))} className={toggleBtnClass(false)}>{trigName('tan')}</button>
        <button onClick={() => append('pi')} className={toggleBtnClass(false)}>π</button>
        <button onClick={() => append('e')} className={toggleBtnClass(false)}>e</button>

        <button onClick={() => wrapSuffix('^2')} className={toggleBtnClass(false)}>x²</button>
        <button onClick={() => wrapSuffix('^3')} className={toggleBtnClass(false)}>x³</button>
        <button onClick={() => wrapSuffix('^')} className={toggleBtnClass(false)}>x^y</button>
        <button onClick={() => wrapPrefix('sqrt')} className={toggleBtnClass(false)}>√x</button>
        <button onClick={() => wrapPrefix('cbrt')} className={toggleBtnClass(false)}>∛x</button>

        <button onClick={() => wrapPrefix('ln')} className={toggleBtnClass(false)}>ln</button>
        <button onClick={() => wrapPrefix('log')} className={toggleBtnClass(false)}>log</button>
        <button onClick={() => append('10^(')} className={toggleBtnClass(false)}>10^x</button>
        <button onClick={() => wrapPrefix('exp')} className={toggleBtnClass(false)}>e^x</button>
        <button onClick={() => wrapPrefix('recip')} className={toggleBtnClass(false)}>1/x</button>

        <button onClick={() => wrapSuffix('!')} className={toggleBtnClass(false)}>x!</button>
        <button onClick={() => wrapPrefix('abs')} className={toggleBtnClass(false)}>|x|</button>
        <button onClick={() => append(' mod ')} className={toggleBtnClass(false)}>mod</button>
        <button onClick={() => append('%')} className={toggleBtnClass(false)}>%</button>
        <button onClick={() => append('*10^(')} className={toggleBtnClass(false)}>×10ⁿ</button>

        <button onClick={() => setMemory(0)} className={toggleBtnClass(false)}>MC</button>
        <button onClick={() => append(formatNumber(memory))} className={toggleBtnClass(false)}>MR</button>
        <button onClick={() => { const v = getCurrentValue(); if (v !== null) setMemory((m) => m + v); }} className={toggleBtnClass(false)}>M+</button>
        <button onClick={() => { const v = getCurrentValue(); if (v !== null) setMemory((m) => m - v); }} className={toggleBtnClass(false)}>M-</button>
        <button onClick={() => { const v = getCurrentValue(); if (v !== null) setMemory(v); }} className={toggleBtnClass(false)}>MS</button>
      </div>

      <button
        onClick={() => setShowTools((v) => !v)}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-800 text-indigo-700 dark:text-indigo-300 text-sm font-semibold border border-indigo-100 dark:border-slate-700"
      >
        <Wrench size={15} /> Advanced Math Tools {showTools ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {showTools && <AdvancedTools />}

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        <CalcButton variant="accent" onClick={handleClear}>AC</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('7')}>7</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('8')}>8</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('9')}>9</CalcButton>

        <CalcButton variant="func" onClick={handleBackspace}><Delete size={20} /></CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('4')}>4</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('5')}>5</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('6')}>6</CalcButton>

        <CalcButton variant="op" onClick={() => handleOperator('/')}>÷</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('1')}>1</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('2')}>2</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('3')}>3</CalcButton>

        <CalcButton variant="op" onClick={() => handleOperator('*')}>×</CalcButton>
        <CalcButton variant="func" onClick={handleSign}>+/−</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('0')}>0</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('.')}>.</CalcButton>

        <CalcButton variant="op" onClick={() => handleOperator('-')}>−</CalcButton>
        <CalcButton variant="op" onClick={() => handleOperator('+')}>+</CalcButton>
        <CalcButton variant="equals" onClick={handleEquals} className="col-span-2">=</CalcButton>
      </div>
    </div>
  );
}
