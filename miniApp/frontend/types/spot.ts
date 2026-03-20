export interface Spot {
  id: string; // または number (場所ID)
  name: string; // 場所名
  catchphrase?: string; // キャッチフレーズ
  distanceFromTransit?: string; // 公共交通機関からの距離
  stayDuration?: string; // 滞在時間
  fukurekoComment?: string; // フクレコの一言
  address: string; // 住所
  businessHours?: string; // 営業時間
  closedDays?: string; // 定休日
  phoneNumber?: string; // 電話番号
  nearestStation?: string; // 最寄り駅
  paymentMethods?: string[]; // 支払方法 (配列を想定)
  parkingInfo?: string; // 駐車場
  websiteUrl?: string; // 公式サイト
  nearbyCoinLockers?: string; // 近くのコインロッカー
  
  // JSON項目は別途専用の型（interface）を定義することをお勧めします
  pricing: PricingInfo; // 料金(JSON)
  placeType: string; // 場所の種類
  
  // タイムスタンプ系は標準的な命名にしています
  updatedAt: Date; // 更新日時
  createdAt: Date; // 作成日時
  deletedAt?: Date | null; // 削除日時 (論理削除用)
  
  facilities: FacilityInfo; // 設備内容(JSON)
  remarks?: string; // 備考
  averageBudget?: string | number; // 平均予算
}

// --- JSON用の型定義（例） ---
export interface PricingInfo {
  // 例: { adult: 1000, child: 500 } など
  [key: string]: any; 
}

export interface FacilityInfo {
  // 例: { hasWifi: true, hasWheelchairAccess: false } など
  [key: string]: any; 
}

export interface Restaurant extends Spot{
  restaurantComment?: string;
  avgLunchBudget?: number;
  avgDinnerBudget?: number;
  seatingInfo?: number;
  avgWaitTime?: string;
}

