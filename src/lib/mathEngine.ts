// A recursive-descent expression parser/evaluator supporting the full
// standard + scientific calculator grammar: + - * / ^ % ! parentheses,
// functions, constants, and the word operator "mod".

export type AngleMode = 'deg' | 'rad';

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2,
  tau: Math.PI * 2,
  c: 299792458,
  G: 6.6743e-11,
  h: 6.62607015e-34,
  NA: 6.02214076e23,
};

function factorial(n: number): number {
  if (n < 0 || !Number.isFinite(n)) return NaN;
  if (Math.abs(n - Math.round(n)) > 1e-9) {
    // Gamma function approximation (Lanczos) for non-integers
    return gamma(n + 1);
  }
  n = Math.round(n);
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function doubleFactorial(n: number): number {
  n = Math.round(n);
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = n; i > 1; i -= 2) r *= i;
  return r;
}

function gamma(x: number): number {
  const g = 7;
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x));
  x -= 1;
  let a = p[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += p[i] / (x + i);
  return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export function nPr(n: number, r: number): number {
  if (r > n || r < 0) return NaN;
  return factorial(n) / factorial(n - r);
}

export function nCr(n: number, r: number): number {
  if (r > n || r < 0) return NaN;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

type Token =
  | { type: 'num'; value: number }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' }
  | { type: 'bang' }
  | { type: 'dbang' }
  | { type: 'percent' };

const FUNCS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'asin', 'acos', 'atan', 'acot', 'asec', 'acsc',
  'arcsin', 'arccos', 'arctan',
  'sinh', 'cosh', 'tanh', 'coth', 'sech', 'csch',
  'asinh', 'acosh', 'atanh', 'acoth', 'asech', 'acsch',
  'log', 'ln', 'logb', 'exp', 'exp2',
  'sqrt', 'cbrt', 'nthroot', 'abs', 'floor', 'ceil', 'round', 'sign',
  'fact', 'dfact', 'npr', 'ncr', 'gcd', 'lcm', 'rand', 'recip',
]);

function tokenize(input: string): Token[] {
  const s = input
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/\s+/g, '');
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      tokens.push({ type: 'num', value: parseFloat(s.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[a-zA-Z_]/.test(s[j])) j++;
      tokens.push({ type: 'ident', value: s.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
    if (c === ')') { tokens.push({ type: 'rparen' }); i++; continue; }
    if (c === ',') { tokens.push({ type: 'comma' }); i++; continue; }
    if (c === '!') {
      if (s[i + 1] === '!') { tokens.push({ type: 'dbang' }); i += 2; }
      else { tokens.push({ type: 'bang' }); i++; }
      continue;
    }
    if (c === '%') { tokens.push({ type: 'percent' }); i++; continue; }
    if ('+-*/^'.includes(c)) { tokens.push({ type: 'op', value: c }); i++; continue; }
    throw new Error(`Unexpected character: ${c}`);
  }
  return tokens;
}

class Parser {
  tokens: Token[];
  pos = 0;
  angleMode: AngleMode;
  memory: number;
  ans: number;

  constructor(tokens: Token[], angleMode: AngleMode, memory: number, ans: number) {
    this.tokens = tokens;
    this.angleMode = angleMode;
    this.memory = memory;
    this.ans = ans;
  }

  peek(): Token | undefined { return this.tokens[this.pos]; }
  next(): Token { return this.tokens[this.pos++]; }

  parse(): number {
    if (this.tokens.length === 0) throw new Error('Empty expression');
    const v = this.parseExpr();
    if (this.pos < this.tokens.length) throw new Error('Unexpected token');
    return v;
  }

  parseExpr(): number {
    let v = this.parseTerm();
    while (this.peek() && this.peek()!.type === 'op' && ((this.peek() as any).value === '+' || (this.peek() as any).value === '-')) {
      const op = (this.next() as any).value;
      const rhs = this.parseTerm();
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  }

  parseTerm(): number {
    let v = this.parseUnary();
    while (true) {
      const t = this.peek();
      if (t && t.type === 'op' && (t.value === '*' || t.value === '/')) {
        const op = (this.next() as any).value;
        const rhs = this.parseUnary();
        v = op === '*' ? v * rhs : v / rhs;
      } else if (t && t.type === 'ident' && t.value === 'mod') {
        this.next();
        const rhs = this.parseUnary();
        v = v % rhs;
      } else break;
    }
    return v;
  }

  parseUnary(): number {
    const t = this.peek();
    if (t && t.type === 'op' && t.value === '-') { this.next(); return -this.parseUnary(); }
    if (t && t.type === 'op' && t.value === '+') { this.next(); return this.parseUnary(); }
    return this.parsePower();
  }

  parsePower(): number {
    const base = this.parsePostfix();
    const t = this.peek();
    if (t && t.type === 'op' && t.value === '^') {
      this.next();
      const exp = this.parseUnary();
      return Math.pow(base, exp);
    }
    return base;
  }

  parsePostfix(): number {
    let v = this.parsePrimary();
    while (true) {
      const t = this.peek();
      if (t && t.type === 'bang') { this.next(); v = factorial(v); }
      else if (t && t.type === 'dbang') { this.next(); v = doubleFactorial(v); }
      else if (t && t.type === 'percent') { this.next(); v = v / 100; }
      else break;
    }
    return v;
  }

  toRad(x: number): number { return this.angleMode === 'deg' ? (x * Math.PI) / 180 : x; }
  fromRad(x: number): number { return this.angleMode === 'deg' ? (x * 180) / Math.PI : x; }

  parsePrimary(): number {
    const t = this.peek();
    if (!t) throw new Error('Unexpected end of expression');
    if (t.type === 'num') { this.next(); return t.value; }
    if (t.type === 'lparen') {
      this.next();
      const v = this.parseExpr();
      const close = this.next();
      if (!close || close.type !== 'rparen') throw new Error('Expected )');
      return v;
    }
    if (t.type === 'ident') {
      this.next();
      const name = t.value;
      if (name === 'ans') return this.ans;
      if (name === 'M') return this.memory;
      if (name in CONSTANTS) return CONSTANTS[name];
      if (FUNCS.has(name)) {
        const open = this.next();
        if (!open || open.type !== 'lparen') throw new Error(`Expected ( after ${name}`);
        const args: number[] = [this.parseExpr()];
        while (this.peek() && this.peek()!.type === 'comma') { this.next(); args.push(this.parseExpr()); }
        const close = this.next();
        if (!close || close.type !== 'rparen') throw new Error('Expected )');
        return this.applyFunc(name, args);
      }
      throw new Error(`Unknown identifier: ${name}`);
    }
    if (t.type === 'op' && t.value === '-') { this.next(); return -this.parseUnary(); }
    throw new Error('Unexpected token in expression');
  }

  applyFunc(name: string, args: number[]): number {
    const x = args[0];
    switch (name) {
      case 'sin': return Math.sin(this.toRad(x));
      case 'cos': return Math.cos(this.toRad(x));
      case 'tan': return Math.tan(this.toRad(x));
      case 'cot': return 1 / Math.tan(this.toRad(x));
      case 'sec': return 1 / Math.cos(this.toRad(x));
      case 'csc': return 1 / Math.sin(this.toRad(x));
      case 'asin': case 'arcsin': return this.fromRad(Math.asin(x));
      case 'acos': case 'arccos': return this.fromRad(Math.acos(x));
      case 'atan': case 'arctan': return this.fromRad(Math.atan(x));
      case 'acot': return this.fromRad(Math.atan(1 / x));
      case 'asec': return this.fromRad(Math.acos(1 / x));
      case 'acsc': return this.fromRad(Math.asin(1 / x));
      case 'sinh': return Math.sinh(x);
      case 'cosh': return Math.cosh(x);
      case 'tanh': return Math.tanh(x);
      case 'coth': return 1 / Math.tanh(x);
      case 'sech': return 1 / Math.cosh(x);
      case 'csch': return 1 / Math.sinh(x);
      case 'asinh': return Math.asinh(x);
      case 'acosh': return Math.acosh(x);
      case 'atanh': return Math.atanh(x);
      case 'acoth': return Math.atanh(1 / x);
      case 'asech': return Math.acosh(1 / x);
      case 'acsch': return Math.asinh(1 / x);
      case 'log': return Math.log10(x);
      case 'ln': return Math.log(x);
      case 'logb': return Math.log(args[1]) / Math.log(x);
      case 'exp': return Math.exp(x);
      case 'exp2': return Math.pow(2, x);
      case 'sqrt': return Math.sqrt(x);
      case 'cbrt': return Math.cbrt(x);
      case 'nthroot': return Math.sign(args[1]) * Math.pow(Math.abs(args[1]), 1 / x);
      case 'abs': return Math.abs(x);
      case 'floor': return Math.floor(x);
      case 'ceil': return Math.ceil(x);
      case 'round': return Math.round(x);
      case 'sign': return Math.sign(x);
      case 'fact': return factorial(x);
      case 'dfact': return doubleFactorial(x);
      case 'npr': return nPr(x, args[1]);
      case 'ncr': return nCr(x, args[1]);
      case 'gcd': return gcd(x, args[1]);
      case 'lcm': return lcm(x, args[1]);
      case 'recip': return 1 / x;
      case 'rand': return Math.random();
      default: throw new Error(`Unknown function: ${name}`);
    }
  }
}

export function autoCloseParens(expr: string): string {
  let open = 0;
  for (const ch of expr) { if (ch === '(') open++; else if (ch === ')') open--; }
  return expr + ')'.repeat(Math.max(0, open));
}

export function evaluateExpression(
  expr: string,
  opts: { angleMode?: AngleMode; memory?: number; ans?: number } = {}
): number {
  const { angleMode = 'deg', memory = 0, ans = 0 } = opts;
  if (!expr || !expr.trim()) throw new Error('Empty expression');
  const tokens = tokenize(expr);
  const parser = new Parser(tokens, angleMode, memory, ans);
  const result = parser.parse();
  if (typeof result !== 'number' || Number.isNaN(result)) throw new Error('Math Error');
  return result;
}

export function safePreview(expr: string, opts: { angleMode?: AngleMode; memory?: number; ans?: number } = {}): string | null {
  try {
    // Don't preview an expression that ends in an operator / open paren / comma — incomplete
    const trimmed = expr.trim();
    if (!trimmed) return null;
    if (/[+\-*/^(,.]$/.test(trimmed.replace(/×|÷|−/g, (m) => ({ '×': '*', '÷': '/', '−': '-' } as any)[m]))) return null;
    const val = evaluateExpression(expr, opts);
    if (!Number.isFinite(val)) return null;
    return formatNumber(val);
  } catch {
    return null;
  }
}

export function formatNumber(n: number, precision = 10): string {
  if (!Number.isFinite(n)) return n > 0 ? '∞' : (n < 0 ? '-∞' : 'Error');
  if (Number.isNaN(n)) return 'Error';
  if (Math.abs(n) > 0 && (Math.abs(n) < 1e-9 || Math.abs(n) >= 1e15)) {
    return n.toExponential(6).replace(/e\+?/, ' × 10^');
  }
  const rounded = parseFloat(n.toPrecision(precision));
  let str = rounded.toString();
  if (str.includes('e')) {
    str = rounded.toExponential(6).replace(/e\+?/, ' × 10^');
  }
  return str;
}

export function isPrime(n: number): boolean {
  n = Math.round(n);
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

export function primeFactorize(n: number): number[] {
  n = Math.round(Math.abs(n));
  const factors: number[] = [];
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) { factors.push(d); n /= d; }
    d++;
  }
  if (n > 1) factors.push(n);
  return factors;
}

export { factorial, doubleFactorial };
