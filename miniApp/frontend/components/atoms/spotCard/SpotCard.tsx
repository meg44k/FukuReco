import { ReactNode } from 'react';
import { Button, IconButton, ThemeProvider, createTheme } from '@mui/material';
import { X, Sun, Moon, User, Baby, Banknote } from 'lucide-react';
import styles from './SpotCard.module.css';
import Image from "next/image"

// 将来的にtypesディレクトリに移動
type SpotKinds = "restaurant" | "sightseeing_spot" | "gift_spot" | "resting_spot" | string;
const MAX_TAGS = 4;

// メインカラー
// 将来的には別の定数フォルダに移動、もしくはpage.tsxでプロバイダで包む
const theme = createTheme({
    palette: {
        primary: {
            main: "#3F7D58",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '9999px', // カプセル型にする
                    fontWeight: 'bold',
                    padding: '8px 0',
                },
            },
        },
    },
})

// アイコンのオブジェクト化
const iconConfig: Record<string, { icon1: ReactNode; icon2: ReactNode | null; bg1: string; bg2: string }> = {
  restaurant: {
    icon1: <Sun />,
    icon2: <Moon />,
    bg1: "#efab58",
    bg2: "#5C6BC0",
  },
  sightseeing_spot: {
    icon1: <User />,
    icon2: <Baby />,
    bg1: "#26A69A",
    bg2: "#EF5350",
  },
  gift_spot: {
    icon1: <Banknote />,
    icon2: null,
    bg1: "#efab58",
    bg2: "transparent",
  },
  resting_spot: {
    icon1: <Banknote />,
    icon2: null,
    bg1: "#efab58",
    bg2: "transparent",
  },
  default: {
    icon1: <Sun />,
    icon2: <Moon />,
    bg1: "#B0B0B0",
    bg2: "#9E9E9E",
  }
  // アイコンの追加はここに
};


type Props = {
    spotKind: SpotKinds;   // 観光地の種類
    spotName: string;   // 店舗(観光地)名
    isOpen?: boolean;   // 営業中かどうか
    imageSrc: string;   // 画像URL
    spotTags: string[]; // タグの配列
    detailURL: string; // 詳細のURL
    price1?: string;    // 飲食店: ランチ価格帯     観光地: 大人入場料
    price2?: string;    // 飲食店: ディナー価格帯   観光地: 小学生以下入場料
    updatedAt?: Date | string;   // 更新日時
    onRouteClick: () => void;   // ルート検索ボタンの動作
    onDetailClick: () => void;  // もっと詳しくボタンの動作
    onCloseClick: () => void;   // 閉じるボタンの動作
};

export const SpotCard = ({
    spotKind,
    spotName,
    isOpen,
    imageSrc,
    spotTags,
    detailURL,
    price1,
    price2,
    updatedAt,
    onRouteClick,
    onDetailClick,
    onCloseClick,
}: Props) => {

    const config = iconConfig[spotKind] || iconConfig.default;
    // タグを最大4つに
    const limitedTags = spotTags.slice(0, MAX_TAGS);
    // タグを2つに分割
    const mid = Math.ceil(limitedTags.length / 2);
    const firstRowTags = limitedTags.slice(0, mid);
    const secondRowTags = limitedTags.slice(mid);

    return (
        <ThemeProvider theme={theme}>
            <div className={styles.spotCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleContainer}>
                        <div className={styles.title}>{spotName}</div>
                    </div>

                    {typeof isOpen === 'boolean' && (
                    <div
                        className={`${styles.statusBadge} ${
                        isOpen ? styles.open : styles.closed
                        }`}
                    >
                        {isOpen ? "営業中" : "営業時間外"}
                    </div>
                    )}

                    <IconButton onClick={onCloseClick} size="small">
                    <X />
                    </IconButton>
                </div>

                <div className={styles.cardImage}>
                    {imageSrc ? (
                    <Image 
                        src={imageSrc} 
                        alt="画像なし" 
                        fill 
                        style={{ objectFit: "cover" }}
                        unoptimized={imageSrc.startsWith('http')}
                    />
                    ) : (
                    <div className={styles.noImagePlaceholder}>
                        <span>No Image</span>
                    </div>
                    )}
                </div>

                <div className={styles.cardContents}>
                    <div className={styles.row}>
                        <div className={styles.tagsRow}>
                            {firstRowTags.map((tag, index) => (
                            <span key={index} className={styles.tag}>
                                #{tag}
                            </span>
                            ))}
                        </div>

                        {config.icon1 && (
                            <div className={styles.pieceRange}>
                                <span
                                className={styles.icon}
                                style={{ backgroundColor: config.bg1 }}
                                >
                                {config.icon1}
                                </span>
                                {price1 || "-"}
                            </div>
                        )}
                    </div>

                    <div className={styles.row}>
                        <div className={styles.tagsRow}>
                            {secondRowTags.map((tag, index) => (
                            <span key={index} className={styles.tag}>
                                #{tag}
                            </span>
                            ))}
                        </div>

                        {config.icon2 && (
                            <div className={styles.pieceRange}>
                                <span
                                className={styles.icon}
                                style={{ backgroundColor: config.bg2 }}
                                >
                                {config.icon2}
                                </span>
                                {price2 || "-"}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <Button onClick={onDetailClick} variant="contained" href={detailURL}>
                    もっと詳しく
                    </Button>
                    <Button onClick={onRouteClick} variant="outlined">
                    ルートを見る
                    </Button>
                </div>
            </div>
        </ThemeProvider>
    );
};