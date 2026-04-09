import { MapComponent } from "@/components/organisms/map/MapComponent";
import { MapSpotData, MinimalSpotData } from "@/types/map";
import { createClient } from '@/lib/supabase/server';

export default async function MapPage() {
  // 1. 検索結果（例：もつ鍋で検索してヒットした数件）※現状はモックデータ
  const searchResults: MapSpotData[] = [];

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
