// キャッシュをクリア
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        // supabaseクライアント
        const supabase = await createClient();
        // クエリを取り出す
        const { searchParams } = new URL(request.url);
        const options = searchParams.get('options');
        const keyword = searchParams.get('keyword');

        // バリデーション
        if (!options && !keyword) {
            return NextResponse.json([], { status: 200 });
        }

        if (keyword) {
            // キーワード検索（店舗名、キャッチフレーズ、フクレココメントに対して部分一致検索を行う）
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
                .or(`name.ilike.%${keyword}%,catchphrase.ilike.%${keyword}%,fukureko_comment.ilike.%${keyword}%`);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            // mapでjsonを展開
            const formattedData = data.map((item: any) => {
                // サムネイル画像を取得
                const thumbnail = item.assets?.find((a: any) => a.is_cardthumbnail === true);
                const imageSrc = thumbnail?.url || "/sampleImage.png";

                return {
                    id: item.id,
                    spotKind: item.place_type,
                    pinKind: item.place_type === "Restaurant" ? "/FoodPin.svg" : "/CameraPin.svg",
                    spotName: item.name,
                    imageSrc: imageSrc,
                    spotTags: item.spot_tags?.map((st: any) => st.tags?.detail).filter(Boolean) || [],
                    detailURL: `/spots/restaurant/${item.id}`,
                    price1: typeof item.pricing === 'string' ? item.pricing : "価格情報なし",
                    position: {
                        lat: parseFloat(item.latitude),
                        lng: parseFloat(item.longitude)
                    },
                    updatedAt: new Date(item.updated_at)
                };
            });

            return NextResponse.json(formattedData);

        } else if (options) {
            // タグによる完全一致検索
            const { data, error } = await supabase
                // 将来的にはSupabase CLI(または別ファイル)でテーブル名,カラム名を管理
                .from('tags')
                .select(`
                    spot_tags (
                        spots (
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
                        )
                    )
                `)
                .eq('detail', options)
                .single();

            if (error) {
                // タグがヒットしなかった場合、空配列を返す
                if (error.code === 'PGRST116') {
                    return NextResponse.json([]);
                }

                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            // mapでjsonを展開
            const formattedData = data.spot_tags
                .filter((item: any) => item.spots !== null)
                .map((item: any) => {
                    const temp = item.spots;
                    // サムネイル画像を取得
                    const thumbnail = temp.assets?.find((a: any) => a.is_cardthumbnail === true);
                    const imageSrc = thumbnail?.url || "/sampleImage.png";

                    return {
                        id: temp?.id,
                        spotKind: temp?.place_type,
                        pinKind: temp?.place_type === "Restaurant" ? "/FoodPin.svg" : "/CameraPin.svg",
                        spotName: temp?.name,
                        imageSrc: imageSrc,
                        spotTags: temp?.spot_tags?.map((st: any) => st.tags?.detail).filter(Boolean) || [],
                        detailURL: `/spots/restaurant/${temp?.id}`,
                        price1: typeof temp?.pricing === 'string' ? temp?.pricing : "価格情報なし",
                        position: {
                            lat: parseFloat(temp?.latitude),
                            lng: parseFloat(temp?.longitude)
                        },
                        updatedAt: new Date(temp?.updated_at)
                    };
                });

            return NextResponse.json(formattedData);
        }

    } catch (err) {
        console.error('Unexpected Error:', err);
        return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
    }
}
