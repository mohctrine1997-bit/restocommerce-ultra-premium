const pairs = [
  ['comptoir-ink', '#173f35', '#f7f3eb'], ['comptoir-action', '#ffffff', '#853725'],
  ['safran-ink', '#23395b', '#fff7e7'], ['safran-action', '#ffffff', '#9b451f'],
  ['jardin-ink', '#285747', '#f2f6eb'], ['jardin-action', '#ffffff', '#8c3b2b'],
  ['nuit-ink', '#f7f3eb', '#1f2b2b'], ['nuit-card', '#f7f3eb', '#294040'], ['nuit-action', '#1f2b2b', '#d99055'],
];
const rgb = (hex) => hex.slice(1).match(/.{2}/g).map((part) => Number.parseInt(part, 16) / 255);
const luminance = (hex) => rgb(hex).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
let failed = false;
for (const [name, foreground, background] of pairs) { const a = luminance(foreground); const b = luminance(background); const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05); console.log(`${name}: ${ratio.toFixed(2)}:1`); if (ratio < 4.5) failed = true; }
if (failed) { console.error('PALETTE_CONTRAST_FAILED'); process.exit(1); }
console.log('PALETTE_CONTRAST_OK');
