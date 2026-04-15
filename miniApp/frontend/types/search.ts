export type FilterGroup = {
    title: string;
    options: string[];
};

// 表示するタイトルとボタン
export const FILTER_GROUPS: FilterGroup[] = [
    {
        title: "ジャンル",
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
        title: "シーン",
        options: ["ひとりで", "家族", "友人", "恋人"],
    },
    {
        title: "値段・場所",
        options: ["高級", "落ち着き", "アクセス", "安い"],
    },
];
