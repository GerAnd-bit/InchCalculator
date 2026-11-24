/* Pure calculation functions: all amounts are stored in sixteenths of an inch. */
(function (root) {
  const SIXTEENTHS_PER_FOOT = 192;
  const operators = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => Math.round(a * b / 16), '÷': (a, b) => b === 0 ? NaN : Math.round(a * 16 / b) };

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
  function formatFraction(sixteenths) {
    if (!sixteenths) return '';
    const d = gcd(sixteenths, 16);
    return `${sixteenths / d}/${16 / d}`;
  }
  function formatFeetInches(value) {
    const sign = value < 0 ? '−' : '';
    let amount = Math.abs(value);
    const feet = Math.floor(amount / SIXTEENTHS_PER_FOOT);
    amount -= feet * SIXTEENTHS_PER_FOOT;
    const inches = Math.floor(amount / 16);
    const fraction = formatFraction(amount % 16);
    const parts = [];
    if (feet) parts.push(`${feet}′`);
    if (inches || fraction || !feet) parts.push(`${inches ? `${inches}${fraction ? ' ' : ''}` : ''}${fraction}″`);
    return sign + parts.join(' ');
  }
  function formatTotalInches(value) {
    const sign = value < 0 ? '−' : '';
    const amount = Math.abs(value);
    const whole = Math.floor(amount / 16);
    const fraction = formatFraction(amount % 16);
    return `${sign}${whole}${fraction ? ` ${fraction}` : ''} inch${whole === 1 && !fraction ? '' : 'es'}`;
  }
  function parseOperand(source) {
    let s = source.trim().replaceAll('″', ' in ').replaceAll('′', ' ft ');
    if (!s) return NaN;
    const feet = /(-?\d+(?:\.\d+)?)\s*(?:ft|')/i.exec(s);
    let total = feet ? Number(feet[1]) * SIXTEENTHS_PER_FOOT : 0;
    s = s.replace(/-?\d+(?:\.\d+)?\s*(?:ft|')/ig, ' ').trim();
    const numbers = s.match(/-?\d+\/\d+|-?\d+(?:\.\d+)?(?:\s+\d+\/\d+)?/g) || [];
    for (const part of numbers) {
      const [wholePart, fractionPart] = part.trim().split(/\s+/);
      let inches = 0;
      if (wholePart.includes('/')) { const [n, d] = wholePart.split('/').map(Number); inches = n / d; }
      else { inches = Number(wholePart); if (fractionPart) { const [n, d] = fractionPart.split('/').map(Number); inches += n / d; } }
      total += Math.round(inches * 16);
    }
    return total;
  }
  function calculate(tokens) {
    const chunks = [];
    let current = '';
    for (const token of tokens) {
      if (Object.hasOwn(operators, token)) { if (!current.trim()) return NaN; chunks.push(current, token); current = ''; }
      else current += token;
    }
    if (!current.trim()) return NaN;
    chunks.push(current);
    let value = parseOperand(chunks[0]);
    for (let i = 1; i < chunks.length; i += 2) value = operators[chunks[i]](value, parseOperand(chunks[i + 1]));
    return value;
  }
  root.InchCalc = { calculate, formatFeetInches, formatTotalInches };
})(typeof window === 'undefined' ? globalThis : window);
