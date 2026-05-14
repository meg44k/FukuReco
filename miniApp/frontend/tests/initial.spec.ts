import {test, expect} from '@playwright/test'

test('favoritesページにアクセスでき、タイトルが表示されるかの確認', async({ page }) =>{
  await page.goto('/favorites');

  const title = page.getByText('保存済み');
  await expect(title).toBeVisible();
});


test('[VRT]favoritesページの見た目が変わっていないか', async ({ page }) => {
  await page.goto('/favorites');

  await page.getByText('保存済み');


  // Screenshotの正解とあっているかどうかを確認する。
  // 正解画像がなければ撮影される
  // もし正解画像を更新したければ `npx playwright test --update-snapshots`で更新できる
  await expect(page).toHaveScreenshot();
});
