// マップ表示（UI）用のスポットデータ型
export type MapSpotData = {
  id: number;
  spotKind: "shop" | "spot";
  pinKind: string;             // 例: "/FoodPin.svg"
  spotName: string;
  isOpen: boolean;             // google map apiで取得  
  imageSrc: string;
  spotTags: string[];
  detailURL: string;
  price1?: string;             // 表示用にフォーマット済みの価格
  price2?: string;
  position: google.maps.LatLngLiteral; // { lat: number, lng: number }
  updatedAt: Date;
};

// マップ初期表示用の最小限のデータ型
export type MinimalSpotData = {
  id: number;
  position: google.maps.LatLngLiteral;
  pinKind: string;             // アイコンの種類（種類によってピンを変えるため保持）
};

// デフォルトの座標（位置情報が拒否された場合などのフォールバック）
// 博多駅付近
export const HAKATA_STATION: google.maps.LatLngLiteral = {
  lat: 33.5897,
  lng: 130.4208,
};
