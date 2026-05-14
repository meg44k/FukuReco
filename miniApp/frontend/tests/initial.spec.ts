import {test, expect} from '@playwright/test'

test('favoritesページにアクセスでき、タイトルが表示されるかの確認', async({ page }) =>{
  await page.goto('/favorites');

  const title = page.getByText('保存済み');
  await expect(title).toBeVisible();
})

