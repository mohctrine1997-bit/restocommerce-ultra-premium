/** CDC Maître — Lot 2 : diagnostic détaillé LCP à partir du rapport Lighthouse authentifié. */
import fs from 'node:fs/promises';
import path from 'node:path';

const reportPath = process.argv[2] || path.resolve('docs/receipts/lot-2-artifacts/lighthouse-lot-2-dashboard.json');
const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
const audit = (id) => report.audits?.[id] || {};
const bytes = (value = 0) => `${Math.round(value / 1024)} KiB`;
const requests = (audit('network-requests').details?.items || []).map((item) => ({ url: item.url, type: item.resourceType, transfer: item.transferSize || 0, duration: Math.round(item.endTime - item.startTime), start: Math.round(item.startTime) })).sort((a, b) => b.transfer - a.transfer);
const resources = (audit('resource-summary').details?.items || []).map((item) => ({ type: item.label, transfer: item.transferSize || 0, count: item.requestCount || 0 })).sort((a, b) => b.transfer - a.transfer);
const unusedCss = (audit('unused-css-rules').details?.items || []).map((item) => ({ url: item.url, wasted: item.wastedBytes || 0 })).sort((a, b) => b.wasted - a.wasted);
const blocking = (audit('render-blocking-resources').details?.items || []).map((item) => ({ url: item.url, wastedMs: Math.round(item.wastedMs || 0), transfer: item.totalBytes || 0 })).sort((a, b) => b.wastedMs - a.wastedMs);
const result = {
  requestedUrl: report.requestedUrl,
  scores: Object.fromEntries(['performance', 'accessibility', 'best-practices', 'seo'].map((key) => [key, Math.round((report.categories?.[key]?.score ?? 0) * 100)])),
  timings: {
    serverResponse: audit('server-response-time').displayValue,
    lcp: audit('largest-contentful-paint').displayValue,
    fcp: audit('first-contentful-paint').displayValue,
    speedIndex: audit('speed-index').displayValue,
    tbt: audit('total-blocking-time').displayValue,
  },
  resourceSummary: resources.map((entry) => ({ ...entry, transfer: bytes(entry.transfer) })),
  renderBlocking: blocking.map((entry) => ({ ...entry, transfer: bytes(entry.transfer) })),
  unusedCss: unusedCss.slice(0, 12).map((entry) => ({ ...entry, wasted: bytes(entry.wasted) })),
  largestRequests: requests.slice(0, 16).map((entry) => ({ ...entry, transfer: bytes(entry.transfer) })),
  lcpElement: audit('largest-contentful-paint-element').details?.items?.[0] || null,
};
console.log(JSON.stringify(result, null, 2));
