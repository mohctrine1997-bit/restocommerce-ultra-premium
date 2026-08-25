/** Diagnostic détaillé des violations axe-core sur la home WordPress réelle. */
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const origin = (process.env.RC_STAGING_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const testUrl = `${origin}/?rcqa=${Date.now()}`;
const output = '/home/ubuntu/resto-commerce-qa/lot-0/axe-home-detailed.json';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
const page = await context.newPage();

await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1000);
const report = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze();

const violations = report.violations.map((violation) => ({
  id: violation.id,
  impact: violation.impact,
  help: violation.help,
  nodes: violation.nodes.map((node) => ({
    target: node.target,
    html: node.html,
    failureSummary: node.failureSummary,
    any: node.any.map((check) => ({ id: check.id, message: check.message, data: check.data })),
  })),
}));

await fs.mkdir('/home/ubuntu/resto-commerce-qa/lot-0', { recursive: true });
await fs.writeFile(output, JSON.stringify({ origin, testUrl, violations }, null, 2));
console.log(JSON.stringify({ output, testUrl, violations }, null, 2));
await context.close();
await browser.close();
