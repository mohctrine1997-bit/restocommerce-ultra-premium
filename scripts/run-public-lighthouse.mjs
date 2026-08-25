import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = process.env.RC_QA_OUT || path.join('/home/ubuntu/resto-commerce-qa', 'verification-lighthouse', runId);
const targets = [{ id: 'marketplace', path: '/' }, { id: 'restaurant', path: '/restaurant/demo-safran-medina/' }];
const attempts = 2;
await fs.mkdir(outputDir, { recursive: true });

const run = (args) => new Promise((resolve) => {
  const child = spawn('pnpm', ['exec', 'lighthouse', ...args], { cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = ''; let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; }); child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('close', (code) => resolve({ code, stdout, stderr })); child.on('error', (error) => resolve({ code: -1, stdout, stderr: `${stderr}\n${error.message}` }));
});
const score = (report, key) => Math.round((report.categories?.[key]?.score ?? 0) * 100);
const rows = [];
for (const target of targets) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const file = path.join(outputDir, `${target.id}-${attempt}.json`);
    const url = `${origin}${target.path}${target.path.includes('?') ? '&' : '?'}rcqa=${encodeURIComponent(`${runId}-${attempt}`)}`;
    const result = await run([url, '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices,seo', '--form-factor=mobile', '--throttling-method=simulate', '--chrome-flags=--headless --no-sandbox --disable-gpu', '--quiet']);
    if (result.code !== 0) { rows.push({ target: target.id, attempt, status: 'failed', reason: result.stderr || result.stdout }); continue; }
    const report = JSON.parse(await fs.readFile(file, 'utf8'));
    rows.push({ target: target.id, attempt, status: 'completed', scores: { performance: score(report, 'performance'), accessibility: score(report, 'accessibility'), bestPractices: score(report, 'best-practices'), seo: score(report, 'seo') }, metrics: { fcp: report.audits?.['first-contentful-paint']?.numericValue, lcp: report.audits?.['largest-contentful-paint']?.numericValue, tbt: report.audits?.['total-blocking-time']?.numericValue, cls: report.audits?.['cumulative-layout-shift']?.numericValue, speedIndex: report.audits?.['speed-index']?.numericValue } });
  }
}
const summary = { runId, origin, profile: 'Lighthouse mobile simulé, deux passes par route, sans session ni interaction métier.', rows, completedAt: new Date().toISOString() };
await fs.writeFile(path.join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ outputDir, rows }, null, 2));
process.exit(rows.some((row) => row.status !== 'completed') ? 1 : 0);
