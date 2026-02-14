import { test } from '@playwright/test';

test('debug diagram click highlight attrs', async ({ page }) => {
  await page.goto('/tldr');
  await page.waitForTimeout(500);
  const media = await page.evaluate(() => ({
    hasFine: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    hoverNone: window.matchMedia('(hover: none)').matches,
  }));
  console.log('matchMedia', media);

  const node = page.locator('svg[aria-label*="synergy diagram"]').locator('[role="button"][aria-label*="CASS"]');
  await node.click();
  await page.waitForTimeout(200);
  for (let step = 0; step < 20; step++) {
    const state = await page.evaluate((stepValue) => {
      const container = document.getElementById('tool-card-cass');
      const inner = container?.querySelector('[data-testid="tool-card"]') ?? null;
      if (!container || !(inner || container)) return null;
      const el = (inner ?? container) as HTMLElement;
      return {
        step: stepValue,
        containerAttr: container.getAttribute('data-diagram-highlighted'),
        innerAttr: inner ? inner.getAttribute('data-diagram-highlighted') : null,
        opacity: window.getComputedStyle(el).opacity,
        classesHas: ((inner?.getAttribute('class') ?? '').includes('ring-2')),
      };
    }, step);
    console.log('poll', state);
    if (state && state.innerAttr === 'true') break;
    await page.waitForTimeout(100);
  }
  const final = await page.evaluate(() => {
    const container = document.getElementById('tool-card-cass');
    const inner = container?.querySelector('[data-testid="tool-card"]') ?? null;
    if (!container || !(inner || container)) return null;
    const el = (inner ?? container) as HTMLElement;
    return {
      containerAttr: container.getAttribute('data-diagram-highlighted'),
      innerAttr: inner ? inner.getAttribute('data-diagram-highlighted') : null,
      opacity: window.getComputedStyle(el).opacity,
      className: (inner ?? container).getAttribute('class'),
    };
  });
  console.log('final', final);
});
