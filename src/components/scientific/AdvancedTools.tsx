import { useMemo, useState } from 'react';
import { gcd, lcm, nPr, nCr, factorial, doubleFactorial, isPrime, primeFactorize, formatNumber, evaluateExpression } from '../../lib/mathEngine';

const input = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400';
const label = 'text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block';
const resultBox = 'mt-3 p-3 rounded-xl bg-violet-50 dark:bg-slate-900 text-violet-700 dark:text-violet-300 text-sm font-mono-num break-words whitespace-pre-wrap';
const card = 'rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-4';
const sectionTitle = 'font-semibold text-slate-700 dark:text-slate-200 text-sm mb-3';

const TOOLS = [
  { id: 'equation', name: 'Equations' },
  { id: 'matrix', name: 'Matrices' },
  { id: 'vector', name: 'Vectors' },
  { id: 'stats', name: 'Statistics' },
  { id: 'base', name: 'Number Systems' },
  { id: 'combo', name: 'Combinatorics' },
  { id: 'complex', name: 'Complex Numbers' },
  { id: 'fraction', name: 'Fractions & Ratios' },
  { id: 'calculus', name: 'Calculus' },
  { id: 'convert', name: 'DMS & Coordinates' },
];

export default function AdvancedTools() {
  const [active, setActive] = useState('equation');
  return (
    <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 animate-fade-in">
      <div className="flex gap-2 overflow-x-auto pb-3 mb-1 -mx-1 px-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${active === t.id ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className="mt-3">
        {active === 'equation' && <EquationSolver />}
        {active === 'matrix' && <MatrixTool />}
        {active === 'vector' && <VectorTool />}
        {active === 'stats' && <StatisticsTool />}
        {active === 'base' && <BaseConverterTool />}
        {active === 'combo' && <CombinatoricsTool />}
        {active === 'complex' && <ComplexTool />}
        {active === 'fraction' && <FractionTool />}
        {active === 'calculus' && <CalculusTool />}
        {active === 'convert' && <DmsCoordTool />}
      </div>
    </div>
  );
}

function num(v: string): number { return parseFloat(v); }

function EquationSolver() {
  const [mode, setMode] = useState<'linear' | 'quadratic'>('linear');
  const [a, setA] = useState('1'); const [b, setB] = useState('0'); const [c, setC] = useState('0');

  const result = useMemo(() => {
    const A = num(a), B = num(b), C = num(c);
    if (mode === 'linear') {
      if (Number.isNaN(A) || Number.isNaN(B)) return 'Enter valid numbers';
      if (A === 0) return B === 0 ? 'Infinite solutions' : 'No solution';
      return `x = ${formatNumber(-B / A)}`;
    }
    if (Number.isNaN(A) || Number.isNaN(B) || Number.isNaN(C)) return 'Enter valid numbers';
    if (A === 0) return 'Not quadratic (a ≠ 0 required)';
    const disc = B * B - 4 * A * C;
    if (disc > 0) {
      const x1 = (-B + Math.sqrt(disc)) / (2 * A);
      const x2 = (-B - Math.sqrt(disc)) / (2 * A);
      return `Two real roots:\nx₁ = ${formatNumber(x1)}\nx₂ = ${formatNumber(x2)}`;
    }
    if (disc === 0) return `One real root:\nx = ${formatNumber(-B / (2 * A))}`;
    const re = -B / (2 * A);
    const im = Math.sqrt(-disc) / (2 * A);
    return `Complex roots:\nx₁ = ${formatNumber(re)} + ${formatNumber(im)}i\nx₂ = ${formatNumber(re)} − ${formatNumber(im)}i`;
  }, [mode, a, b, c]);

  return (
    <div className={card}>
      <div className={sectionTitle}>Linear & Quadratic Equation Solver</div>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode('linear')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'linear' ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>ax + b = 0</button>
        <button onClick={() => setMode('quadratic')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'quadratic' ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>ax² + bx + c = 0</button>
      </div>
      <div className={`grid ${mode === 'linear' ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
        <div><label className={label}>a</label><input className={input} value={a} onChange={(e) => setA(e.target.value)} inputMode="decimal" /></div>
        <div><label className={label}>b</label><input className={input} value={b} onChange={(e) => setB(e.target.value)} inputMode="decimal" /></div>
        {mode === 'quadratic' && <div><label className={label}>c</label><input className={input} value={c} onChange={(e) => setC(e.target.value)} inputMode="decimal" /></div>}
      </div>
      <div className={resultBox}>{result}</div>
    </div>
  );
}

function parseMatrix(text: string, size: number): number[][] | null {
  const nums = text.split(/[,\s]+/).filter(Boolean).map(Number);
  if (nums.some(Number.isNaN) || nums.length !== size * size) return null;
  const m: number[][] = [];
  for (let i = 0; i < size; i++) m.push(nums.slice(i * size, i * size + size));
  return m;
}

function det(m: number[][]): number {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let d = 0;
  for (let j = 0; j < n; j++) {
    const minor = m.slice(1).map((row) => row.filter((_, k) => k !== j));
    d += (j % 2 === 0 ? 1 : -1) * m[0][j] * det(minor);
  }
  return d;
}

function transpose(m: number[][]): number[][] {
  return m[0].map((_, i) => m.map((row) => row[i]));
}

function inverse(m: number[][]): number[][] | null {
  const n = m.length;
  const d = det(m);
  if (Math.abs(d) < 1e-12) return null;
  if (n === 2) {
    return [[m[1][1] / d, -m[0][1] / d], [-m[1][0] / d, m[0][0] / d]];
  }
  const cof: number[][] = [];
  for (let i = 0; i < n; i++) {
    cof.push([]);
    for (let j = 0; j < n; j++) {
      const minor = m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
      cof[i][j] = ((i + j) % 2 === 0 ? 1 : -1) * det(minor);
    }
  }
  const adj = transpose(cof);
  return adj.map((row) => row.map((v) => v / d));
}

function matMul(a: number[][], b: number[][]): number[][] {
  const n = a.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++) result[i][j] += a[i][k] * b[k][j];
  return result;
}

function fmtMatrix(m: number[][] | null): string {
  if (!m) return 'Not invertible (determinant = 0)';
  return m.map((row) => row.map((v) => formatNumber(v, 6)).join('\t')).join('\n');
}

function MatrixTool() {
  const [size, setSize] = useState(2);
  const [aText, setAText] = useState('1,2,3,4');
  const [bText, setBText] = useState('5,6,7,8');
  const [op, setOp] = useState('add');

  const A = parseMatrix(aText, size);
  const B = parseMatrix(bText, size);

  const result = useMemo(() => {
    if (!A) return 'Matrix A: enter ' + size * size + ' comma-separated numbers';
    if (['add', 'sub', 'mul'].includes(op) && !B) return 'Matrix B: enter ' + size * size + ' comma-separated numbers';
    switch (op) {
      case 'add': return fmtMatrix(A.map((row, i) => row.map((v, j) => v + B![i][j])));
      case 'sub': return fmtMatrix(A.map((row, i) => row.map((v, j) => v - B![i][j])));
      case 'mul': return fmtMatrix(matMul(A, B!));
      case 'det': return `det(A) = ${formatNumber(det(A), 8)}`;
      case 'inv': return fmtMatrix(inverse(A));
      case 'trans': return fmtMatrix(transpose(A));
      default: return '';
    }
  }, [A, B, op, size]);

  return (
    <div className={card}>
      <div className={sectionTitle}>Matrix Calculator</div>
      <div className="flex gap-2 mb-3">
        {[2, 3].map((s) => (
          <button key={s} onClick={() => setSize(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${size === s ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{s}×{s}</button>
        ))}
      </div>
      <label className={label}>Matrix A (row-major, comma separated)</label>
      <input className={input} value={aText} onChange={(e) => setAText(e.target.value)} />
      {['add', 'sub', 'mul'].includes(op) && (
        <>
          <label className={`${label} mt-2`}>Matrix B</label>
          <input className={input} value={bText} onChange={(e) => setBText(e.target.value)} />
        </>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-3">
        {[['add', 'A+B'], ['sub', 'A-B'], ['mul', 'A×B'], ['det', 'det(A)'], ['inv', 'A⁻¹'], ['trans', 'Aᵀ']].map(([id, lbl]) => (
          <button key={id} onClick={() => setOp(id)} className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${op === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{lbl}</button>
        ))}
      </div>
      <div className={resultBox}>{result}</div>
    </div>
  );
}

function VectorTool() {
  const [dim, setDim] = useState(3);
  const [aText, setAText] = useState('1,2,3');
  const [bText, setBText] = useState('4,5,6');
  const [op, setOp] = useState('add');

  const parseVec = (t: string) => {
    const n = t.split(/[,\s]+/).filter(Boolean).map(Number);
    return n.length === dim && !n.some(Number.isNaN) ? n : null;
  };
  const A = parseVec(aText); const B = parseVec(bText);

  const result = useMemo(() => {
    if (!A) return `Vector A: enter ${dim} comma-separated numbers`;
    if (op !== 'magA' && !B) return `Vector B: enter ${dim} comma-separated numbers`;
    switch (op) {
      case 'add': return `(${A.map((v, i) => v + B![i]).map((v) => formatNumber(v)).join(', ')})`;
      case 'sub': return `(${A.map((v, i) => v - B![i]).map((v) => formatNumber(v)).join(', ')})`;
      case 'dot': return `A · B = ${formatNumber(A.reduce((s, v, i) => s + v * B![i], 0))}`;
      case 'cross': {
        if (dim !== 3) return 'Cross product requires 3D vectors';
        const [a1, a2, a3] = A; const [b1, b2, b3] = B!;
        return `(${formatNumber(a2 * b3 - a3 * b2)}, ${formatNumber(a3 * b1 - a1 * b3)}, ${formatNumber(a1 * b2 - a2 * b1)})`;
      }
      case 'magA': return `|A| = ${formatNumber(Math.sqrt(A.reduce((s, v) => s + v * v, 0)))}`;
      default: return '';
    }
  }, [A, B, op, dim]);

  return (
    <div className={card}>
      <div className={sectionTitle}>Vector Calculator</div>
      <div className="flex gap-2 mb-3">
        {[2, 3].map((d) => (
          <button key={d} onClick={() => setDim(d)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${dim === d ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{d}D</button>
        ))}
      </div>
      <label className={label}>Vector A</label>
      <input className={input} value={aText} onChange={(e) => setAText(e.target.value)} />
      {op !== 'magA' && (<><label className={`${label} mt-2`}>Vector B</label><input className={input} value={bText} onChange={(e) => setBText(e.target.value)} /></>)}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mt-3">
        {[['add', 'A+B'], ['sub', 'A-B'], ['dot', 'A·B'], ['cross', 'A×B'], ['magA', '|A|']].map(([id, lbl]) => (
          <button key={id} onClick={() => setOp(id)} className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${op === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{lbl}</button>
        ))}
      </div>
      <div className={resultBox}>{result}</div>
    </div>
  );
}

function StatisticsTool() {
  const [text, setText] = useState('4, 8, 15, 16, 23, 42');
  const result = useMemo(() => {
    const nums = text.split(/[,\s]+/).filter(Boolean).map(Number);
    if (nums.some(Number.isNaN) || nums.length === 0) return 'Enter comma or space separated numbers';
    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const sorted = [...nums].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[(n - 1) / 2];
    const freq: Record<string, number> = {};
    nums.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter((k) => freq[k] === maxFreq).map(Number);
    const mode = maxFreq === 1 ? 'None' : modes.join(', ');
    const variancePop = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const varianceSample = n > 1 ? nums.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1) : 0;
    return [
      `Count: ${n}`,
      `Sum: ${formatNumber(sum)}`,
      `Mean: ${formatNumber(mean)}`,
      `Median: ${formatNumber(median)}`,
      `Mode: ${mode}`,
      `Variance (population): ${formatNumber(variancePop)}`,
      `Variance (sample): ${formatNumber(varianceSample)}`,
      `Std Dev (population): ${formatNumber(Math.sqrt(variancePop))}`,
      `Std Dev (sample): ${formatNumber(Math.sqrt(varianceSample))}`,
    ].join('\n');
  }, [text]);

  return (
    <div className={card}>
      <div className={sectionTitle}>Statistics</div>
      <label className={label}>Data set</label>
      <textarea className={`${input} resize-none`} rows={2} value={text} onChange={(e) => setText(e.target.value)} />
      <div className={resultBox}>{result}</div>
    </div>
  );
}

function toBase(n: number, base: number): string {
  if (!Number.isFinite(n)) return 'Error';
  const neg = n < 0;
  const s = Math.abs(Math.trunc(n)).toString(base).toUpperCase();
  return neg ? '-' + s : s;
}

function BaseConverterTool() {
  const [value, setValue] = useState('255');
  const [fromBase, setFromBase] = useState(10);
  const bases = [2, 8, 10, 16];

  const parsed = parseInt(value || '0', fromBase);
  const valid = !Number.isNaN(parsed) && /^-?[0-9a-fA-F]+$/.test(value.trim() || '0');

  const [bitA, setBitA] = useState('12');
  const [bitB, setBitB] = useState('10');
  const [bitOp, setBitOp] = useState('AND');
  const a = parseInt(bitA, 10) || 0;
  const b = parseInt(bitB, 10) || 0;
  const bitResult = useMemo(() => {
    switch (bitOp) {
      case 'AND': return a & b;
      case 'OR': return a | b;
      case 'XOR': return a ^ b;
      case 'NOT A': return ~a;
      case 'LSHIFT': return a << b;
      case 'RSHIFT': return a >> b;
      default: return 0;
    }
  }, [a, b, bitOp]);

  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <div className={sectionTitle}>Number Base Converter</div>
        <div className="flex gap-2 mb-3">
          {bases.map((b) => (
            <button key={b} onClick={() => setFromBase(b)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${fromBase === b ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {b === 2 ? 'Binary' : b === 8 ? 'Octal' : b === 10 ? 'Decimal' : 'Hex'}
            </button>
          ))}
        </div>
        <input className={input} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter a number" />
        {valid ? (
          <div className={resultBox}>{`Binary:  ${toBase(parsed, 2)}\nOctal:   ${toBase(parsed, 8)}\nDecimal: ${toBase(parsed, 10)}\nHex:     ${toBase(parsed, 16)}`}</div>
        ) : (
          <div className={resultBox}>Invalid number for base {fromBase}</div>
        )}
      </div>
      <div className={card}>
        <div className={sectionTitle}>Bitwise Operations (decimal input)</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className={label}>A</label><input className={input} value={bitA} onChange={(e) => setBitA(e.target.value)} /></div>
          <div><label className={label}>B</label><input className={input} value={bitB} onChange={(e) => setBitB(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {['AND', 'OR', 'XOR', 'NOT A', 'LSHIFT', 'RSHIFT'].map((o) => (
            <button key={o} onClick={() => setBitOp(o)} className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${bitOp === o ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{o}</button>
          ))}
        </div>
        <div className={resultBox}>{`Result: ${bitResult} (bin: ${toBase(bitResult, 2)}, hex: ${toBase(bitResult, 16)})`}</div>
      </div>
    </div>
  );
}

function CombinatoricsTool() {
  const [n, setN] = useState('5');
  const [r, setR] = useState('2');
  const [primeInput, setPrimeInput] = useState('17');
  const [rangeMin, setRangeMin] = useState('1');
  const [rangeMax, setRangeMax] = useState('100');
  const [favorable, setFavorable] = useState('1');
  const [total, setTotal] = useState('6');
  const [randomVal, setRandomVal] = useState<number | null>(null);

  const N = num(n), R = num(r);
  const combo = useMemo(() => {
    if (Number.isNaN(N) || Number.isNaN(R)) return 'Enter valid n and r';
    return [
      `n! = ${formatNumber(factorial(N))}`,
      `n!! (double factorial) = ${formatNumber(doubleFactorial(N))}`,
      `nPr = ${formatNumber(nPr(N, R))}`,
      `nCr = ${formatNumber(nCr(N, R))}`,
      `GCD(n,r) = ${gcd(N, R)}`,
      `LCM(n,r) = ${lcm(N, R)}`,
    ].join('\n');
  }, [N, R]);

  const primeN = num(primeInput);
  const primeResult = useMemo(() => {
    if (Number.isNaN(primeN)) return 'Enter a number';
    const factors = primeFactorize(primeN);
    return `${primeN} is ${isPrime(primeN) ? 'prime' : 'not prime'}\nPrime factorization: ${factors.join(' × ') || 'n/a'}`;
  }, [primeN]);

  const probResult = useMemo(() => {
    const f = num(favorable), t = num(total);
    if (Number.isNaN(f) || Number.isNaN(t) || t === 0) return 'Enter valid values';
    return `P = ${formatNumber(f / t)} (${formatNumber((f / t) * 100)}%)`;
  }, [favorable, total]);

  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <div className={sectionTitle}>Permutations, Combinations, GCD/LCM, Factorial</div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={label}>n</label><input className={input} value={n} onChange={(e) => setN(e.target.value)} /></div>
          <div><label className={label}>r</label><input className={input} value={r} onChange={(e) => setR(e.target.value)} /></div>
        </div>
        <div className={resultBox}>{combo}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>Prime Check & Factorization</div>
        <input className={input} value={primeInput} onChange={(e) => setPrimeInput(e.target.value)} />
        <div className={resultBox}>{primeResult}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>Random Number & Probability</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className={label}>Min</label><input className={input} value={rangeMin} onChange={(e) => setRangeMin(e.target.value)} /></div>
          <div><label className={label}>Max</label><input className={input} value={rangeMax} onChange={(e) => setRangeMax(e.target.value)} /></div>
        </div>
        <button onClick={() => { const mn = num(rangeMin), mx = num(rangeMax); setRandomVal(Math.floor(Math.random() * (mx - mn + 1)) + mn); }} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold">Generate Random Integer</button>
        {randomVal !== null && <div className={resultBox}>Result: {randomVal}</div>}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div><label className={label}>Favorable outcomes</label><input className={input} value={favorable} onChange={(e) => setFavorable(e.target.value)} /></div>
          <div><label className={label}>Total outcomes</label><input className={input} value={total} onChange={(e) => setTotal(e.target.value)} /></div>
        </div>
        <div className={resultBox}>{probResult}</div>
      </div>
    </div>
  );
}

function ComplexTool() {
  const [a1, setA1] = useState('3'); const [b1, setB1] = useState('4');
  const [a2, setA2] = useState('1'); const [b2, setB2] = useState('2');
  const A1 = num(a1), B1 = num(b1), A2 = num(a2), B2 = num(b2);

  const results = useMemo(() => {
    if ([A1, B1, A2, B2].some(Number.isNaN)) return { add: '', sub: '', mul: '', div: '', mag: '', conj: '', polar: '' };
    const add = `${formatNumber(A1 + A2)} ${B1 + B2 >= 0 ? '+' : '-'} ${formatNumber(Math.abs(B1 + B2))}i`;
    const sub = `${formatNumber(A1 - A2)} ${B1 - B2 >= 0 ? '+' : '-'} ${formatNumber(Math.abs(B1 - B2))}i`;
    const mulRe = A1 * A2 - B1 * B2, mulIm = A1 * B2 + B1 * A2;
    const mul = `${formatNumber(mulRe)} ${mulIm >= 0 ? '+' : '-'} ${formatNumber(Math.abs(mulIm))}i`;
    const denom = A2 * A2 + B2 * B2;
    const divRe = (A1 * A2 + B1 * B2) / denom, divIm = (B1 * A2 - A1 * B2) / denom;
    const div = denom === 0 ? 'Division by zero' : `${formatNumber(divRe)} ${divIm >= 0 ? '+' : '-'} ${formatNumber(Math.abs(divIm))}i`;
    const mag = formatNumber(Math.sqrt(A1 * A1 + B1 * B1));
    const conj = `${formatNumber(A1)} ${-B1 >= 0 ? '+' : '-'} ${formatNumber(Math.abs(B1))}i`;
    const r = Math.sqrt(A1 * A1 + B1 * B1);
    const theta = Math.atan2(B1, A1) * (180 / Math.PI);
    const polar = `r = ${formatNumber(r)}, θ = ${formatNumber(theta)}°`;
    return { add, sub, mul, div, mag, conj, polar };
  }, [A1, B1, A2, B2]);

  return (
    <div className={card}>
      <div className={sectionTitle}>Complex Numbers (z₁ = a₁ + b₁i, z₂ = a₂ + b₂i)</div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={label}>a₁</label><input className={input} value={a1} onChange={(e) => setA1(e.target.value)} /></div>
        <div><label className={label}>b₁</label><input className={input} value={b1} onChange={(e) => setB1(e.target.value)} /></div>
        <div><label className={label}>a₂</label><input className={input} value={a2} onChange={(e) => setA2(e.target.value)} /></div>
        <div><label className={label}>b₂</label><input className={input} value={b2} onChange={(e) => setB2(e.target.value)} /></div>
      </div>
      <div className={resultBox}>{`z₁+z₂ = ${results.add}\nz₁-z₂ = ${results.sub}\nz₁×z₂ = ${results.mul}\nz₁/z₂ = ${results.div}\n|z₁| = ${results.mag}\nconj(z₁) = ${results.conj}\nPolar(z₁): ${results.polar}`}</div>
    </div>
  );
}

function simplifyFraction(n: number, d: number): [number, number] {
  if (d === 0) return [n, d];
  const g = gcd(n, d) || 1;
  const sign = d < 0 ? -1 : 1;
  return [(n / g) * sign, Math.abs(d / g)];
}

function FractionTool() {
  const [n1, setN1] = useState('6'); const [d1, setD1] = useState('8');
  const [n2, setN2] = useState('1'); const [d2, setD2] = useState('4');
  const [op, setOp] = useState('simplify');
  const N1 = num(n1), D1 = num(d1), N2 = num(n2), D2 = num(d2);

  const result = useMemo(() => {
    if ([N1, D1].some(Number.isNaN) || D1 === 0) return 'Enter valid fraction';
    if (op === 'simplify') {
      const [sn, sd] = simplifyFraction(N1, D1);
      return `${N1}/${D1} = ${sn}/${sd} = ${formatNumber(N1 / D1)}`;
    }
    if ([N2, D2].some(Number.isNaN) || D2 === 0) return 'Enter valid second fraction';
    let rn = 0, rd = 1;
    if (op === 'add') { rn = N1 * D2 + N2 * D1; rd = D1 * D2; }
    if (op === 'sub') { rn = N1 * D2 - N2 * D1; rd = D1 * D2; }
    if (op === 'mul') { rn = N1 * N2; rd = D1 * D2; }
    if (op === 'div') { rn = N1 * D2; rd = D1 * N2; }
    const [sn, sd] = simplifyFraction(rn, rd);
    return `Result: ${sn}/${sd} = ${formatNumber(sn / sd)}`;
  }, [N1, D1, N2, D2, op]);

  const [ratioA, setRatioA] = useState('4'); const [ratioB, setRatioB] = useState('8');
  const ratioResult = useMemo(() => {
    const a = num(ratioA), b = num(ratioB);
    if (Number.isNaN(a) || Number.isNaN(b) || b === 0) return 'Enter valid ratio';
    const g = gcd(a, b) || 1;
    return `${a}:${b} = ${a / g}:${b / g}`;
  }, [ratioA, ratioB]);

  const [pa, setPa] = useState('2'); const [pb, setPb] = useState('3'); const [pc, setPc] = useState('10');
  const proportionResult = useMemo(() => {
    const A = num(pa), B = num(pb), C = num(pc);
    if ([A, B, C].some(Number.isNaN) || A === 0) return 'Enter valid a, b, c';
    return `a/b = c/x → x = ${formatNumber((B * C) / A)}`;
  }, [pa, pb, pc]);

  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <div className={sectionTitle}>Fraction Calculator</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className={label}>Numerator 1</label><input className={input} value={n1} onChange={(e) => setN1(e.target.value)} /></div>
          <div><label className={label}>Denominator 1</label><input className={input} value={d1} onChange={(e) => setD1(e.target.value)} /></div>
        </div>
        {op !== 'simplify' && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><label className={label}>Numerator 2</label><input className={input} value={n2} onChange={(e) => setN2(e.target.value)} /></div>
            <div><label className={label}>Denominator 2</label><input className={input} value={d2} onChange={(e) => setD2(e.target.value)} /></div>
          </div>
        )}
        <div className="grid grid-cols-5 gap-1.5">
          {[['simplify', 'Simplify'], ['add', '+'], ['sub', '−'], ['mul', '×'], ['div', '÷']].map(([id, lbl]) => (
            <button key={id} onClick={() => setOp(id)} className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${op === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{lbl}</button>
          ))}
        </div>
        <div className={resultBox}>{result}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>Ratio Simplifier</div>
        <div className="grid grid-cols-2 gap-2">
          <input className={input} value={ratioA} onChange={(e) => setRatioA(e.target.value)} placeholder="A" />
          <input className={input} value={ratioB} onChange={(e) => setRatioB(e.target.value)} placeholder="B" />
        </div>
        <div className={resultBox}>{ratioResult}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>Proportion Solver (a/b = c/x)</div>
        <div className="grid grid-cols-3 gap-2">
          <input className={input} value={pa} onChange={(e) => setPa(e.target.value)} placeholder="a" />
          <input className={input} value={pb} onChange={(e) => setPb(e.target.value)} placeholder="b" />
          <input className={input} value={pc} onChange={(e) => setPc(e.target.value)} placeholder="c" />
        </div>
        <div className={resultBox}>{proportionResult}</div>
      </div>
    </div>
  );
}

function CalculusTool() {
  const [sumExpr, setSumExpr] = useState('n^2');
  const [sumFrom, setSumFrom] = useState('1');
  const [sumTo, setSumTo] = useState('5');
  const [sumMode, setSumMode] = useState<'sum' | 'prod'>('sum');

  const sumResult = useMemo(() => {
    const from = Math.round(num(sumFrom)), to = Math.round(num(sumTo));
    if (Number.isNaN(from) || Number.isNaN(to) || to < from || to - from > 100000) return 'Enter a valid range (max 100000 terms)';
    try {
      let acc = sumMode === 'sum' ? 0 : 1;
      for (let i = from; i <= to; i++) {
        const substituted = sumExpr.replace(/\bn\b/g, `(${i})`);
        const v = evaluateExpression(substituted);
        acc = sumMode === 'sum' ? acc + v : acc * v;
      }
      return `${sumMode === 'sum' ? 'Σ' : 'Π'} = ${formatNumber(acc)}`;
    } catch {
      return 'Invalid expression (use variable n)';
    }
  }, [sumExpr, sumFrom, sumTo, sumMode]);

  const [derivExpr, setDerivExpr] = useState('x^2');
  const [derivAt, setDerivAt] = useState('3');
  const derivResult = useMemo(() => {
    const x0 = num(derivAt);
    if (Number.isNaN(x0)) return 'Enter a valid point';
    try {
      const h = 1e-5;
      const f = (xv: number) => evaluateExpression(derivExpr.replace(/\bx\b/g, `(${xv})`));
      const deriv = (f(x0 + h) - f(x0 - h)) / (2 * h);
      return `f'(${x0}) ≈ ${formatNumber(deriv)}`;
    } catch { return 'Invalid expression (use variable x)'; }
  }, [derivExpr, derivAt]);

  const [intExpr, setIntExpr] = useState('x^2');
  const [intFrom, setIntFrom] = useState('0');
  const [intTo, setIntTo] = useState('1');
  const intResult = useMemo(() => {
    const a = num(intFrom), b = num(intTo);
    if (Number.isNaN(a) || Number.isNaN(b)) return 'Enter valid bounds';
    try {
      const f = (xv: number) => evaluateExpression(intExpr.replace(/\bx\b/g, `(${xv})`));
      const n = 1000;
      const h = (b - a) / n;
      let s = f(a) + f(b);
      for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
      const integral = (h / 3) * s;
      return `∫ f(x) dx ≈ ${formatNumber(integral)}`;
    } catch { return 'Invalid expression (use variable x)'; }
  }, [intExpr, intFrom, intTo]);

  const [limExpr, setLimExpr] = useState('sin(x)/x');
  const [limAt, setLimAt] = useState('0');
  const limResult = useMemo(() => {
    const x0 = num(limAt);
    if (Number.isNaN(x0)) return 'Enter a valid point';
    try {
      const h = 1e-6;
      const f = (xv: number) => evaluateExpression(limExpr.replace(/\bx\b/g, `(${xv})`), { angleMode: 'rad' });
      const left = f(x0 - h), right = f(x0 + h);
      return `lim x→${x0}: ${formatNumber((left + right) / 2)} (left ≈ ${formatNumber(left)}, right ≈ ${formatNumber(right)})`;
    } catch { return 'Invalid expression (use variable x)'; }
  }, [limExpr, limAt]);

  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <div className={sectionTitle}>Summation Σ / Product Π (use variable n)</div>
        <div className="flex gap-2 mb-2">
          <button onClick={() => setSumMode('sum')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${sumMode === 'sum' ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Σ Sum</button>
          <button onClick={() => setSumMode('prod')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${sumMode === 'prod' ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Π Product</button>
        </div>
        <label className={label}>f(n)</label>
        <input className={input} value={sumExpr} onChange={(e) => setSumExpr(e.target.value)} />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div><label className={label}>From n=</label><input className={input} value={sumFrom} onChange={(e) => setSumFrom(e.target.value)} /></div>
          <div><label className={label}>To n=</label><input className={input} value={sumTo} onChange={(e) => setSumTo(e.target.value)} /></div>
        </div>
        <div className={resultBox}>{sumResult}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>Numerical Derivative (use variable x)</div>
        <label className={label}>f(x)</label>
        <input className={input} value={derivExpr} onChange={(e) => setDerivExpr(e.target.value)} />
        <label className={`${label} mt-2`}>At x =</label>
        <input className={input} value={derivAt} onChange={(e) => setDerivAt(e.target.value)} />
        <div className={resultBox}>{derivResult}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>Numerical Integration (Simpson's Rule, use variable x)</div>
        <label className={label}>f(x)</label>
        <input className={input} value={intExpr} onChange={(e) => setIntExpr(e.target.value)} />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div><label className={label}>From x=</label><input className={input} value={intFrom} onChange={(e) => setIntFrom(e.target.value)} /></div>
          <div><label className={label}>To x=</label><input className={input} value={intTo} onChange={(e) => setIntTo(e.target.value)} /></div>
        </div>
        <div className={resultBox}>{intResult}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>Limit Approximation (use variable x, radians)</div>
        <label className={label}>f(x)</label>
        <input className={input} value={limExpr} onChange={(e) => setLimExpr(e.target.value)} />
        <label className={`${label} mt-2`}>As x →</label>
        <input className={input} value={limAt} onChange={(e) => setLimAt(e.target.value)} />
        <div className={resultBox}>{limResult}</div>
      </div>
    </div>
  );
}

function DmsCoordTool() {
  const [decDeg, setDecDeg] = useState('45.5125');
  const dmsResult = useMemo(() => {
    const d = num(decDeg);
    if (Number.isNaN(d)) return 'Enter a valid decimal degree';
    const sign = d < 0 ? -1 : 1;
    const abs = Math.abs(d);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = (minFloat - min) * 60;
    return `${sign < 0 ? '-' : ''}${deg}° ${min}' ${formatNumber(sec, 4)}"`;
  }, [decDeg]);

  const [dmsD, setDmsD] = useState('45'); const [dmsM, setDmsM] = useState('30'); const [dmsS, setDmsS] = useState('45');
  const decResult = useMemo(() => {
    const d = num(dmsD), m = num(dmsM), s = num(dmsS);
    if ([d, m, s].some(Number.isNaN)) return 'Enter valid D, M, S';
    const sign = d < 0 ? -1 : 1;
    return `${formatNumber(sign * (Math.abs(d) + m / 60 + s / 3600), 8)}°`;
  }, [dmsD, dmsM, dmsS]);

  const [cx, setCx] = useState('3'); const [cy, setCy] = useState('4');
  const polarResult = useMemo(() => {
    const x = num(cx), y = num(cy);
    if (Number.isNaN(x) || Number.isNaN(y)) return 'Enter valid x, y';
    const r = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x) * (180 / Math.PI);
    return `r = ${formatNumber(r)}, θ = ${formatNumber(theta)}°`;
  }, [cx, cy]);

  const [pr, setPr] = useState('5'); const [ptheta, setPtheta] = useState('53.13');
  const cartResult = useMemo(() => {
    const r = num(pr), theta = num(ptheta);
    if (Number.isNaN(r) || Number.isNaN(theta)) return 'Enter valid r, θ';
    const rad = (theta * Math.PI) / 180;
    return `x = ${formatNumber(r * Math.cos(rad))}, y = ${formatNumber(r * Math.sin(rad))}`;
  }, [pr, ptheta]);

  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <div className={sectionTitle}>Decimal Degrees → DMS</div>
        <input className={input} value={decDeg} onChange={(e) => setDecDeg(e.target.value)} />
        <div className={resultBox}>{dmsResult}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>DMS → Decimal Degrees</div>
        <div className="grid grid-cols-3 gap-2">
          <input className={input} value={dmsD} onChange={(e) => setDmsD(e.target.value)} placeholder="deg" />
          <input className={input} value={dmsM} onChange={(e) => setDmsM(e.target.value)} placeholder="min" />
          <input className={input} value={dmsS} onChange={(e) => setDmsS(e.target.value)} placeholder="sec" />
        </div>
        <div className={resultBox}>{decResult}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>Cartesian → Polar</div>
        <div className="grid grid-cols-2 gap-2">
          <input className={input} value={cx} onChange={(e) => setCx(e.target.value)} placeholder="x" />
          <input className={input} value={cy} onChange={(e) => setCy(e.target.value)} placeholder="y" />
        </div>
        <div className={resultBox}>{polarResult}</div>
      </div>
      <div className={card}>
        <div className={sectionTitle}>Polar → Cartesian</div>
        <div className="grid grid-cols-2 gap-2">
          <input className={input} value={pr} onChange={(e) => setPr(e.target.value)} placeholder="r" />
          <input className={input} value={ptheta} onChange={(e) => setPtheta(e.target.value)} placeholder="θ (deg)" />
        </div>
        <div className={resultBox}>{cartResult}</div>
      </div>
    </div>
  );
}
