export interface Menu {
    spotId: string; // 場所ID
    name: string; // メニュー名
    price: number; // 金額
    detail: string; // メニューの説明
    AssetId: string; // メニューの写真
    isRecommend: boolean; // おすすめかどうか
}