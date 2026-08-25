import fs from 'node:fs/promises';

const reportPath = process.argv[2];
if (!reportPath) throw new Error('Usage: node scripts/inspect-lighthouse-artifact.mjs <rapport.json>');

const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
const audit = (id) => report.audits?.[id] || {};
const pickRows = (id, limit = 12) => (audit(id).details?.items || []).slice(0, limit).map((item) => ({
  url: item.url || item.source || '',
  totalBytes: item.totalBytes || item.transferSize || 0,
  wastedBytes: item.wastedBytes || 0,
  wastedMs: Math.round(item.wastedMs || 0),
  selector: item.node?.selector || '',
	snippet: item.node?.snippet || '',
}));
const pickImageNetworkRows = () => (audit('network-requests').details?.items || [])
	.filter((item) => item.resourceType === 'Image' || /\.(?:avif|gif|jpe?g|png|webp)(?:\?|$)/i.test(item.url || ''))
	.slice(0, 24)
	.map((item) => ({ url: item.url || '', totalBytes: item.totalBytes || item.transferSize || 0, resourceType: item.resourceType || '' }));

const summary = {
  scores: Object.fromEntries(Object.entries(report.categories || {}).map(([key, value]) => [key, Math.round((value.score || 0) * 100)])),
  metrics: {
    lcp: audit('largest-contentful-paint').displayValue,
    cls: audit('cumulative-layout-shift').displayValue,
    tbt: audit('total-blocking-time').displayValue,
    serverResponse: audit('server-response-time').displayValue,
  },
  lcpInsights: {
    breakdown: audit('lcp-breakdown-insight').details?.items?.[0] || null,
    discovery: audit('lcp-discovery-insight').details?.items?.[0] || null,
  },
  lcpElement: pickRows('largest-contentful-paint-element', 3),
  diagnostics: pickRows('diagnostics', 3),
  unusedCss: pickRows('unused-css-rules'),
	renderBlocking: pickRows('render-blocking-resources'),
	network: pickRows('network-requests'),
	networkImages: pickImageNetworkRows(),
};

console.log(JSON.stringify(summary, null, 2));
