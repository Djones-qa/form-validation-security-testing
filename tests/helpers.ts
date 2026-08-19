import { Page } from '@playwright/test';

export async function showStep(page: Page, step: number, desc: string) {
  await page.evaluate(({ s, d }) => {
    const el = document.getElementById('qa-overlay');
    if (el) el.remove();
    const div = document.createElement('div');
    div.id = 'qa-overlay';
    div.style.cssText = 'position:fixed;top:10px;left:10px;z-index:99999;background:rgba(0,0,0,0.9);color:#00ff88;padding:14px 22px;border-radius:8px;font:bold 15px monospace;border:2px solid #00ff88;max-width:90%';
    div.textContent = `Step ${s}: ${d}`;
    document.body.appendChild(div);
  }, { s: step, d: desc });
  await page.waitForTimeout(1800);
}

export async function showFinding(page: Page, id: string, desc: string, type: 'VULN' | 'PASS' | 'INFO') {
  await page.evaluate(({ i, d, t }) => {
    const el = document.getElementById('qa-finding');
    if (el) el.remove();
    const div = document.createElement('div');
    div.id = 'qa-finding';
    const colors = { VULN: { bg: 'rgba(80,0,0,0.95)', border: '#ff4444', text: '#ff4444' }, PASS: { bg: 'rgba(0,60,0,0.95)', border: '#00ff00', text: '#00ff00' }, INFO: { bg: 'rgba(0,40,80,0.95)', border: '#66ccff', text: '#66ccff' } };
    const c = colors[t as keyof typeof colors];
    div.style.cssText = `position:fixed;top:60px;left:10px;z-index:99999;background:${c.bg};color:white;padding:12px 20px;border-radius:8px;font:bold 13px monospace;border:2px solid ${c.border};max-width:85%`;
    div.innerHTML = `<span style="color:${c.text}">[${i}] ${t}</span><br>${d}`;
    document.body.appendChild(div);
  }, { i: id, d: desc, t: type });
  await page.waitForTimeout(2200);
}
