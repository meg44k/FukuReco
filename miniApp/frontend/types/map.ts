// マップ表示（UI）用のスポットデータ型
export type MapSpotData = {
  id: number;
  spotKind: "shop" | "spot";
  pinKind: string;             // 例: "/FoodPin.svg"
  spotName: string;
  isOpen: boolean;             // 営業時間から計算済みのフラグ
  imageSrc: string;
  spotTags: string[];
  detailURL: string;
  price1?: string;             // 表示用にフォーマット済みの価格
  price2?: string;
  position: google.maps.LatLngLiteral; // { lat: number, lng: number }
  updatedAt: Date;
};
