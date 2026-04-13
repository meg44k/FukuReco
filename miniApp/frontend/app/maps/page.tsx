import { MapComponent } from "@/components/organisms/map/MapComponent";
import { MinimalSpotData } from "@/types/map";
import { createClient } from '@/lib/supabase/server';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MapPage({ searchParams }: Props) {
  const params = await searchParams;
  const keyword = typeof params?.keyword === 'string' ? params.keyword : undefined;
  const options = typeof params?.options === 'string' ? params.options : undefined;

  // DBから初期表示用の全店舗データ（最小限のピン情報）のみを取得
  // これにより、カードが表示される前でもマップ上にピンが表示される
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

  const initialSpots: MinimalSpotData[] = (data || []).map((spot: any) => {
      let pinKind = "/FoodPin.svg";
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

  // 検索条件 (keyword, options) をそのままクライアントコンポーネントに渡す
  // クライアント側で位置情報が確定した瞬間に、これらを使ってAPIを叩く
  return <MapComponent initialSpots={initialSpots} keyword={keyword} options={options} />;
}