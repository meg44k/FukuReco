 /** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';

describe('テストインフラの確認', () => {
  it('MSW: /api/search がモックデータを返すこと',
async () => {
    const response = await fetch('/api/search');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeInstanceOf(Array);

expect(data[0].spotName).toBe('テスト観光スポット');
// handlers.ts で定義した名前
  });

  it('MSW: Supabaseへのリクエストが横取りされていること', async () => {
    // SupabaseのURL（ダミー）へのリクエスト
    const response = await
fetch('https://xyz.supabase.co/rest/v1/spots');
    const data = await response.json();

    expect(data[0].name).toBe('テスト観光スポット');
  });

  it('Google Maps:モックがグローバルに定義されていること', () => {
    expect(google.maps.Map).toBeDefined();
    const map = new
google.maps.Map(document.createElement('div'));
    expect(map.panTo).toBeDefined();
  });
});
