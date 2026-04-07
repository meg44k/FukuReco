// キャッシュを無効化
export const dynamic = 'force-dynamic';

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
                placeType
            `);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // フロントエンドの MinimalSpotData 形式に合わせて変換
        // placeType に基づいて pinKind を決定するロジック（仮）
        const formattedData = data.map((spot: any) => {
            let pinKind = "/FoodPin.svg"; // デフォルト
            
            if (spot.placeType === "Cafe") pinKind = "/ChairPin.svg";
            else if (spot.placeType === "Sightseeing") pinKind = "/CameraPin.svg";
            else if (spot.placeType === "Shop") pinKind = "/GiftPin.svg";
            
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
