import { useEffect, useRef, useState } from 'react';
import { Delete, Copy, Share2, Check } from 'lucide-react';
import CalcButton from '../components/CalcButton';
import { evaluateExpression, formatNumber, safePreview, autoCloseParens } from '../lib/mathEngine';
import { addHistoryEntry } from '../lib/db';
import { saveDraft, loadDraft, clearDraft, applyThousandsSeparator } from '../lib/settings';
import { useSettings } from '../contexts/SettingsContext';

export default function StandardCalculator() {
  const { settings } = useSettings();
  const [expr, setExpr] = useState<string>(() => loadDraft('standard'));
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { saveDraft('standard', expr); }, [expr]);

  const preview = safePreview(expr);
  const prettyExpr = expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/(?<=\d|\))-(?=\d|\()/g, '−');

  const append = (s: string) => {
    setJustEvaluated(false);
    setExpr((prev) => prev + s);
  };

  const handleDigit = (d: string) => {
    if (justEvaluated) { setExpr(d === '.' ? '0.' : d); setJustEvaluated(false); return; }
    append(d);
  };

  const handleOperator = (op: string) => {
    if (justEvaluated) { setJustEvaluated(false); setExpr((prev) => prev + op); return; }
    append(op);
  };

  const handleClear = () => { setExpr(''); setJustEvaluated(false); clearDraft('standard'); };

  const handleBackspace = () => {
    setJustEvaluated(false);
    setExpr((prev) => prev.slice(0, -1));
  };

  const handlePercent = () => append('%');

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

  const handleEquals = async () => {
    const closed = autoCloseParens(expr);
    try {
      const result = evaluateExpression(closed);
      const formatted = formatNumber(result, settings.decimalPrecision);
      const displayExpr = prettyExpr;
      await addHistoryEntry({ expression: displayExpr, answer: applyThousandsSeparator(formatted, settings.thousandsSeparator), category: 'Standard', timestamp: Date.now() });
      setExpr(formatted);
      setJustEvaluated(true);
      clearDraft('standard');
    } catch {
      setExpr('Error');
      setJustEvaluated(true);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (/[0-9.]/.test(e.key)) { handleDigit(e.key); return; }
      if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') { handleOperator(e.key); return; }
      if (e.key === '(' || e.key === ')') { append(e.key); return; }
      if (e.key === '%') { handlePercent(); return; }
      if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); handleEquals(); return; }
      if (e.key === 'Backspace') { handleBackspace(); return; }
      if (e.key === 'Escape') { handleClear(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const copyResult = async () => {
    const val = preview || expr;
    try {
      await navigator.clipboard.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const shareResult = async () => {
    const text = `${prettyExpr} = ${preview || expr}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div ref={containerRef} className="rounded-3xl bg-white dark:bg-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 p-5 sm:p-7 min-h-[160px] flex flex-col justify-end">
        <div className="flex justify-end gap-2 mb-2">
          <button onClick={copyResult} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors" title="Copy result">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button onClick={shareResult} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors" title="Share calculation">
            <Share2 size={16} />
          </button>
        </div>
        <div className="font-mono-num text-2xl sm:text-4xl font-light text-right text-slate-800 dark:text-slate-100 break-all leading-tight">
          {prettyExpr || '0'}
        </div>
        <div className="font-mono-num text-sm sm:text-base font-light text-right text-slate-400 dark:text-slate-500 mt-2 h-6">
          {!justEvaluated && preview !== null && preview !== prettyExpr ? `= ${applyThousandsSeparator(preview, settings.thousandsSeparator)}` : ' '}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        <CalcButton variant="accent" onClick={handleClear}>AC</CalcButton>
        <CalcButton variant="func" onClick={() => append('(')}>(</CalcButton>
        <CalcButton variant="func" onClick={() => append(')')}>)</CalcButton>
        <CalcButton variant="func" onClick={handleBackspace}><Delete size={20} /></CalcButton>

        <CalcButton variant="digit" onClick={() => handleDigit('7')}>7</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('8')}>8</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('9')}>9</CalcButton>
        <CalcButton variant="op" onClick={() => handleOperator('/')}>÷</CalcButton>

        <CalcButton variant="digit" onClick={() => handleDigit('4')}>4</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('5')}>5</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('6')}>6</CalcButton>
        <CalcButton variant="op" onClick={() => handleOperator('*')}>×</CalcButton>

        <CalcButton variant="digit" onClick={() => handleDigit('1')}>1</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('2')}>2</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('3')}>3</CalcButton>
        <CalcButton variant="op" onClick={() => handleOperator('-')}>−</CalcButton>

        <CalcButton variant="func" onClick={handleSign}>+/−</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('0')}>0</CalcButton>
        <CalcButton variant="digit" onClick={() => handleDigit('.')}>.</CalcButton>
        <CalcButton variant="op" onClick={() => handleOperator('+')}>+</CalcButton>

        <CalcButton variant="func" onClick={handlePercent}>%</CalcButton>
        <CalcButton variant="equals" onClick={handleEquals} className="col-span-3">=</CalcButton>
      </div>
    </div>
  );
}
