// キャッシュを無効化
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        
        // URLからIDを取得 (?id=123)
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'IDが指定されていません' }, { status: 400 });
        }

        // 指定されたIDのスポット詳細情報を取得
        const { data, error } = await supabase
            .from('spots')
            .select(`
                id,
                name,
                place_type,
                pricing,
                latitude,
                longitude,
                updated_at,
                spot_tags (
                    tags (
                        detail 
                    )
                ),
                assets (
                    url,
                    is_cardthumbnail
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'スポットが見つかりませんでした' }, { status: 404 });
        }

        // サムネイル画像を取得（is_cardthumbnailがtrueのもの）
        const thumbnail = (data.assets as { url: string; is_cardthumbnail: boolean }[] | null)?.find((a) => a.is_cardthumbnail === true);
        const imageSrc = thumbnail?.url || "/sampleImage.png"; // 見つからなければデフォルト画像

        // MapSpotData (UI用) の形式に整形
        const formattedData = {
            id: data.id,
            spotKind: data.place_type,
            // 本来はカテゴリ等から判定するが、一旦共通のパスをセット（フロントエンドで上書き可能）
            pinKind: data.place_type === "Restaurant" ? "/FoodPin.svg" : "/CameraPin.svg",
            spotName: data.name,
            imageSrc: imageSrc,
            spotTags: (data.spot_tags as unknown as { tags: { detail: string }[] | { detail: string } | null }[] | null)?.map((st) => {
                const tags = st.tags;
                if (Array.isArray(tags)) return tags[0]?.detail;
                return (tags as { detail: string } | null)?.detail;
            }).filter(Boolean) || [],
            detailURL: `/spots/restaurant/${data.id}`,
            price1: typeof data.pricing === 'string' ? data.pricing : "価格情報なし", // pricingの形式に合わせて調整が必要
            position: {
                lat: data.latitude,
                lng: data.longitude
            },
            updatedAt: new Date(data.updated_at)
        };

        return NextResponse.json(formattedData);

    } catch (err) {
        console.error('Unexpected Error:', err);
        return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
    }
}
