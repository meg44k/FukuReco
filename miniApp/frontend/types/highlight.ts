// 観光地などのおすすめ風景などの型
export interface highlight {
    id: string;
    spotId: string;
    label?: string; // ~からの景色などの写真のタイトル的なもの
    detail?: string; // 説明
    assetId?: string;
    isRecommend?: string;
}