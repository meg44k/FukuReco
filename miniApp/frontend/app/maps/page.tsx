import { MapComponent } from "@/components/organisms/map/MapComponent";
import { MapSpotData } from "@/types/map";

export default function MapPage() {
  // 親（サーバーコンポーネント）でテストデータを定義
  // 将来的にはここでDB(Supabase)からデータを取得する
  const testSpots: MapSpotData[] = [
    {
      id: 1,
      spotKind: "shop",
      pinKind: "/FoodPin.svg",
      spotName: "なんとかラーメン",
      isOpen: true,
      imageSrc: "/sampleImage.png",
      spotTags: ["ラーメン", "豚骨", "待ち時間少", "禁煙"],
      detailURL: "/spots/restaurant/1",
      price1: "￥1,000〜2,000",
      position: { lat: 33.5905, lng: 130.3817 },
      updatedAt: new Date(),
    },
    {
      id: 2,
      spotKind: "shop",
      pinKind: "/ChairPin.svg",
      spotName: "なんとかなるうどん",
      isOpen: true,
      imageSrc: "/sampleImage.png",
      spotTags: ["うどん", "地元人気", "待ち時間少", "禁煙"],
      detailURL: "/spots/restaurant/2",
      price1: "￥800〜1,500",
      position: { lat: 33.5900, lng: 130.3998 },
      updatedAt: new Date(),
    },
    {
      id: 3,
      spotKind: "shop",
      pinKind: "/CameraPin.svg",
      spotName: "なんとかもつ鍋",
      isOpen: false,
      imageSrc: "/sampleImage.png",
      spotTags: ["もつ鍋", "博多名物", "予約必須"],
      detailURL: "/spots/restaurant/3",
      price1: "￥3,000〜5,000",
      position: { lat: 33.5905, lng: 130.3857 },
      updatedAt: new Date(),
    },
    {
      id: 4,
      spotKind: "shop",
      pinKind: "/GiftPin.svg",
      spotName: "なんとかなる明太子",
      isOpen: true,
      imageSrc: "/sampleImage.png",
      spotTags: ["明太子", "お土産", "駅近"],
      detailURL: "/spots/restaurant/4",
      price1: "￥1,500〜3,000",
      position: { lat: 33.5900, lng: 130.3958 },
      updatedAt: new Date(),
    },
  ];

  return <MapComponent spots={testSpots} />;
}
