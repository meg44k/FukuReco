import { Button, IconButton, ThemeProvider, createTheme } from '@mui/material';
import { X, Sun, Moon, User, Baby } from 'lucide-react';
import './SpotCard.css';

// 将来的にtypesディレクトリに移動
type SpotKinds = "shop" | "spot";

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
const iconConfig = {
  shop: {
    icon1: <Sun />,
    icon2: <Moon />,
    bg1: "#FFA726",
    bg2: "#5C6BC0",
  },
  spot: {
    icon1: <User />,
    icon2: <Baby />,
    bg1: "#26A69A",
    bg2: "#EF5350",
  },
  // アイコンの追加はここに
};


type Props = {
    spotKind: SpotKinds;   // 観光地の種類
    spotName: string;   // 店舗(観光地)名
    isOpen?: boolean;   // 営業中かどうか
    imageSrc: string;   // 画像URL
    spotTags: string[]; // タグの配列
    price1?: string;    // 飲食店: ランチ価格帯     観光地: 大人入場料
    price2?: string;    // 飲食店: ディナー価格帯   観光地: 小学生以下入場料
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
    price1,
    price2,
    onRouteClick,
    onDetailClick,
    onCloseClick,
}: Props) => {

    const config = iconConfig[spotKind];
    // タグを最大4つに
    const limitedTags = spotTags.slice(0, 4);
    // タグを2つに分割
    const mid = Math.ceil(limitedTags.length / 2);
    const firstRowTags = limitedTags.slice(0, mid);
    const secondRowTags = limitedTags.slice(mid);

    return (
        <ThemeProvider theme={theme}>
            <div className='spotCard'>
                {/* ヘッダー部分　タイトル,営業中,クローズボタン */}
                <div className='cardHeader'>
                    <div className='title'>{spotName}</div>
                    {typeof isOpen === 'boolean' && (
                        <div className={`statusBadge ${isOpen ? 'open' : 'closed'}`}>{isOpen ? "営業中" : "営業時間外"}</div>
                    )}
                    <IconButton onClick={onCloseClick} size="small"><X></X></IconButton>
                </div>

                {/* 画像部分 */}
                <div className='cardImage'>
                    {imageSrc ? (
                        <img src={imageSrc} alt='画像なし' />
                    ) : (
                        <div className='noImagePlaceholder'><span>No Image</span></div>
                    )}
                </div>

                {/* コンテンツ部分　タグ,価格帯 */}
                <div className='cardContents'>
                    <div className='row'>
                        <div className='tagsRow'>
                            {firstRowTags.map((tag, index) => (
                                <span key={index} className='tag'>#{tag}</span>
                            ))}
                        </div>
                        <div className='pieceRange'>
                            <span className='icon' style={{ backgroundColor: config.bg1}}>{config.icon1}</span>
                            {price1 || "-"}
                        </div>
                    </div>
                    <div className='row'>
                        <div className='tagsRow'>
                            {secondRowTags.map((tag, index) => (
                                <span key={index} className='tag'>#{tag}</span>
                            ))}
                        </div>
                        <div className='pieceRange'>
                            <span className='icon' style={{ backgroundColor: config.bg2}}>{config.icon2}</span>
                            {price2 || "-"}
                        </div>
                    </div>
                </div>

                {/* フッター部分　ルートボタン,詳細ボタン */}
                <div className='cardFooter'>
                    <Button onClick={onDetailClick} variant='contained'>もっと詳しく</Button>
                    <Button onClick={onRouteClick} variant='outlined'>ルートを見る</Button>
                </div>
            </div>
        </ThemeProvider>
    );
};
