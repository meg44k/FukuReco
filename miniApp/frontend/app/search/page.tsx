'use client'

import React from "react";
import { Button } from "@mui/material";
import styles from './page.module.css'
import { SearchTextField } from "@/components/atoms/searchTextField/SearchTextField";
import { useRouter } from "next/navigation";

// 表示するタイトルとボタン
const FILTER_GROUPS = [
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

export default function Search() {
    const router = useRouter();

    //　ボタン検索ハンドラ
    const handleButtonSearch = (option: string) => {
        // クエリパラメータ組み立て用標準API
        const params = new URLSearchParams();

        // 1つのボタンしか選択できないため、パラメータは1つ
        params.append("optinos", option);

        // マップページに遷移
        router.push(`/maps?${params.toString()}`);
    }

    // テキスト検索ハンドラ
    const handleTextSearch = (keyword: string) => {
        // クエリパラメータ組み立て用標準API
        const params = new URLSearchParams();
        params.append("keyword", keyword);

        // マップページに遷移
        router.push(`/maps?${params.toString()}`);
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>条件から検索</h1>

            <div className={styles.filterContent}>
                {FILTER_GROUPS.map((group, groupIndex) => (
                    <div key={groupIndex} className={styles.section}>
                        <h2 className={styles.sectionTitle}>{group.title}</h2>
                        <div className={styles.buttonGrid}>
                            {group.options.map((option, optionIndex) => {
                                // 市松模様（チェッカーボード）の配色判定
                                const isDark = (Math.floor(optionIndex / 2) + (optionIndex % 2)) % 2 === 0;
                                const buttonClass = isDark ? styles.buttonDark : styles.buttonLight;

                                return (
                                    <Button
                                        key={optionIndex}
                                        variant="contained"
                                        disableElevation
                                        className={`${styles.customButton} ${buttonClass}`}
                                        onClick={() => handleButtonSearch(option)}
                                    >
                                        {option}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* 検索バーのみを下部に固定 */}
            <div className={styles.searchTextField}>
                <SearchTextField onSearch={handleTextSearch}/>
            </div>
        </div>
    );
}
