import { http, HttpResponse } from 'msw'

/**
 * 共通のモックデータ
 */
const mockMapSpot: any = {
  id: 1,
  spotName: 'テスト観光スポット',
  spotKind: 'spot',
  pinKind: '/CameraPin.svg',
  position: { lat: 33.5902, lng: 130.4017 },
  imageSrc: '/sampleImage.png',
  isOpen: true,
  spotTags: ['観光', '絶景'],
  detailURL: '/spots/sightseeing/1',
  price1: '¥1,000',
  updatedAt: new Date().toISOString()
}

export const handlers = [
  // --- Next.js Internal API Mocks ---

  // 検索API
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword')
    
    // 検索ワードがある場合にデータを変える例
    if (keyword === 'empty') {
      return HttpResponse.json([])
    }

    return HttpResponse.json([mockMapSpot])
  }),

  // スポット詳細カードAPI
  http.get('/api/spotcard', () => {
    return HttpResponse.json(mockMapSpot)
  }),


  // --- Supabase REST API Mocks ---
  // Supabase URLは環境変数によって変わるため、ワイルドカードでマッチさせます
  
  // spotsテーブルへのクエリ
  http.get('*/rest/v1/spots*', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'テスト観光スポット',
        place_type: 'sightseeing',
        latitude: 33.5902,
        longitude: 130.4017,
        // 必要に応じて他のフィールドを追加
      }
    ])
  }),

  // assetsテーブル（画像など）へのクエリ
  http.get('*/rest/v1/assets*', () => {
    return HttpResponse.json([
      {
        spot_id: 1,
        url: '/sampleImage.png',
        is_cardthumbnail: true
      }
    ])
  }),

  // spot_tagsテーブルへのクエリ
  http.get('*/rest/v1/spot_tags*', () => {
    return HttpResponse.json([
      {
        tags: {
          detail: '観光'
        }
      },
      {
        tags: {
          detail: '絶景'
        }
      }
    ])
  })
]
