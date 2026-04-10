import { MapComponent } from "@/components/organisms/map/MapComponent";
import { MapSpotData, MinimalSpotData } from "@/types/map";
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MapPage({ searchParams }: Props) {
  const params = await searchParams;
  const keyword = typeof params?.keyword === 'string' ? params.keyword : undefined;
  const options = typeof params?.options === 'string' ? params.options : undefined;

  // 1. 検索結果
  let searchResults: MapSpotData[] = [];

  if (keyword || options) {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const url = new URL(`${baseUrl}/api/search`);
    if (keyword) url.searchParams.append('keyword', keyword);
    if (options) url.searchParams.append('options', options);

    try {
      const res = await fetch(url.toString());
      if (res.ok) {
        searchResults = await res.json();
      } else {
        console.error("検索結果の取得に失敗しました", res.statusText);
      }
    } catch (error) {
      console.error("検索API呼び出しエラー:", error);
    }
  }

  // 2. DBから初期表示用の全店舗データ（最小限）を取得
  const supabase = await createClient();
  const { data, error } = await supabase
      .from('spots')
      .select(`
          id,
          latitude,
          longitude,
          place_type
      `);

  if (error) {
      console.error("マップ初期データの取得に失敗しました", error);
  }

  // 取得したデータを MinimalSpotData 型にマッピング
  const initialSpots: MinimalSpotData[] = (data || []).map((spot: any) => {
      let pinKind = "/FoodPin.svg"; // 今後デフォルトのピンに変更
      
      // 仮のピン画像割り当てロジック
      if (spot.place_type === "restaurant") pinKind = "/FoodPin.svg";
      else if (spot.place_type === "sightseeing_spot") pinKind = "/CameraPin.svg";
      else if (spot.place_type === "resting_spot") pinKind = "/ChairPin.svg";
      else if (spot.place_type === "gift_spot") pinKind = "/GiftPin.svg";
      
      return {
          id: spot.id,
          position: { lat: parseFloat(spot.latitude), lng: parseFloat(spot.longitude) },
          pinKind: pinKind
      };
  });

  return <MapComponent searchResults={searchResults} initialSpots={initialSpots} />;
}
