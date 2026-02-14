import { test } from '@playwright/test';

async function isToolCardInViewport(page, toolId: string) {
  return page.evaluate((id: string) => {
    const toolCard = document.getElementById(`tool-card-${id}`);
    const card = toolCard?.querySelector('[data-testid="tool-card"]') ?? toolCard;
    if (!card) {
      return false;
    }

    const rect = card.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }, toolId);
}

test('probe probe', async ({ page }) => {
  await page.goto('/tldr');
  const diagram = page.locator('svg[aria-label*="synergy diagram"]');
  const cassNode = diagram.locator('[role="button"][aria-label*="CASS"]');

  await cassNode.click();
  let cardInView = await isToolCardInViewport(page, 'cass');
  console.log('card in viewport immediately', cardInView);

  const waitUntil = Date.now();
  let visibleAt = false;
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(150);
    cardInView = await isToolCardInViewport(page, 'cass');
    if (cardInView) {
      visibleAt = true;
      break;
    }
    console.log('not in view at', Date.now() - waitUntil);
  }

  const highlightResult = await page.$$eval('#tool-card-cass [data-testid="tool-card"], #tool-card-cass', (els) =>
    els.some((el) => el.getAttribute('data-diagram-highlighted') === 'true')
  );
  console.log('card in viewport', visibleAt, 'highlight', highlightResult);
});
