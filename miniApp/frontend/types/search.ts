export type FilterGroup = {
    title: string;
    options: string[];
};

// 表示するタイトルとボタン
export const FILTER_GROUPS: FilterGroup[] = [
    {
        title: "ジャンルから絞る",
        options: [
            "もつ鍋", "ラーメン",
            "水炊き", "居酒屋",
            "パン", "スイーツ",
            "カフェ", "焼き鳥",
            "うどん", "明太子",
            "海鮮", "焼肉",
            "写真映え", "夜景",
        ],
    },
    {
        title: "人数から絞る",
        options: ["ひとりで", "家族", "友人", "恋人"],
    },
    {
        title: "値段・場所から絞る",
        options: ["高級", "落ち着き", "アクセス", "安い"],
    },
];
