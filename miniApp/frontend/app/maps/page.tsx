import { MapComponent } from "@/components/organisms/map/MapComponent";
import { MapSpotData, MinimalSpotData } from "@/types/map";

export default function MapPage() {
  // 1. 検索結果（例：もつ鍋で検索してヒットした数件）
  const searchResults: MapSpotData[] = [
    {
      id: 1,
      spotKind: "shop",
      pinKind: "/FoodPin.svg",
      spotName: "なんとかラーメン (検索結果)",
      isOpen: true,
      imageSrc: "/sampleImage.png",
      spotTags: ["ラーメン", "豚骨", "待ち時間少", "禁煙"],
      detailURL: "/spots/restaurant/1",
      price1: "￥1,000〜2,000",
      position: { lat: 33.5905, lng: 130.3817 },
      updatedAt: new Date(),
    }
  ];

  // 2. 初期表示用の全店舗データ（100〜1000件規模を想定）
  const initialSpots: MinimalSpotData[] = [
    { id: 1, position: { lat: 33.5905, lng: 130.3817 }, pinKind: "/FoodPin.svg" },
    { id: 2, position: { lat: 33.5900, lng: 130.3998 }, pinKind: "/ChairPin.svg" },
    { id: 3, position: { lat: 33.5905, lng: 130.3857 }, pinKind: "/CameraPin.svg" },
    { id: 4, position: { lat: 33.5900, lng: 130.3958 }, pinKind: "/GiftPin.svg" },
  ];

  return <MapComponent searchResults={searchResults} initialSpots={initialSpots} />;
}