// 1時間キャッシュ（必要に応じて調整）
export const revalidate = 3600;

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        // supabaseクライアント
        const supabase = await createClient();

        // 全スポットのID、座標、種類を取得
        // 将来的にはSupabase CLI(または別ファイル)でテーブル名,カラム名を管理
        const { data, error } = await supabase
            .from('spots')
            .select(`
                id,
                latitude,
                longitude,
                place_type
            `);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // フロントエンドの MinimalSpotData 形式に合わせて変換
        // place_type に基づいて pin画像 を決定するロジック（修正必須）
        const formattedData = (data as { id: number, latitude: number, longitude: number, place_type: string }[]).map((spot) => {
            let pinKind = "/FoodPin.svg"; // デフォルト
            
            if (spot.place_type === "Cafe") pinKind = "/ChairPin.svg";
            else if (spot.place_type === "Sightseeing") pinKind = "/CameraPin.svg";
            else if (spot.place_type === "Shop") pinKind = "/GiftPin.svg";
            
            return {
                id: spot.id,
                position: {
                    lat: spot.latitude,
                    lng: spot.longitude
                },
                pinKind: pinKind
            };
        });

        return NextResponse.json(formattedData);

    } catch (err) {
        console.error('Unexpected Error:', err);
        return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
    }
}
