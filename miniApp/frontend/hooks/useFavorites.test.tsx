/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFavorites } from './useFavorites';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/node';

// useLIFF をモックする
vi.mock('@/providers/liff-providers', () => ({
  useLIFF: () => ({
    liff: {
      isLoggedIn: () => true,
      getProfile: () => Promise.resolve({ userId: 'test-user-id' }),
    },
  }),
}));

describe('useFavorites フック', () => {
  it('初期状態では loading が trueであり、お気に入りリストが空であること', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.loading).toBe(true);
    expect(result.current.favorites).toEqual([]);
    expect(result.current.loading).toBe(true)
  });


it('データ取得後、お気に入りリストが正しくセットされること', async () => {
    // Supabase の favoritesテーブルからのレスポンスをモック
    server.use(
      http.get('*/rest/v1/favorites*', () => {
        return HttpResponse.json([{ spot_id: 101 }, { spot_id: 102 }]);
      })
    );

    const { result } = renderHook(() => useFavorites());

    await waitFor(() =>
    expect(result.current.favorites).toContain(101));

    expect(result.current.favorites).toEqual([101, 102]);
    expect(result.current.isFavorite(101)).toBe(true);
    expect(result.current.isFavorite(999)).toBe(false);
  });
});
