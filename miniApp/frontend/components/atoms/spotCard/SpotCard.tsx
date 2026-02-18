import { Button, IconButton, ThemeProvider, createTheme } from '@mui/material';
import { X, Sun, Moon, User, Baby } from 'lucide-react';
import './SpotCard.css';

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

type Props = {
    spotKind: string;   // 観光地の種類
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

    // スポットの種類によって価格帯のアイコンを変更
    let icon1 = null;
    let icon2 = null;
    switch(spotKind) {
        case "shop":
            icon1 = <Sun/>;
            icon2 = <Moon/>;
            break;
        case "spot":
            icon1 = <User/>;
            icon2 = <Baby/>;
            break;
        // アイコンを追加はここに

        default:
            break;
    }

    return (
        <ThemeProvider theme={theme}>
            <div className='spotCard'>
                {/* ヘッダー部分　タイトル,営業中,クローズボタン */}
                <div className='cardHeader'>
                    <div className='title'>{spotName}</div>
                    {typeof isOpen === 'boolean' && (
                        <div className='shopStatus'>{isOpen ? "営業中" : "営業時間外"}</div>
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
                    <div className='tagArea'></div>
                    <div className='priceRangeArea'>
                        <div className='pieceRange'>{icon1}{price1 || "-"}</div>
                        <div className='pieceRange'>{icon2}{price2 || "-"}</div>
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
