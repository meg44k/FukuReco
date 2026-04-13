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
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        // 距離計算用関数 (Haversine formula)
        const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        // バリデーション
        if (!options && !keyword) {
            return NextResponse.json([], { status: 200 });
        }

        let rawData: any[] = [];

        if (keyword) {
            // キーワード検索
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

            if (error) throw error;
            rawData = data || [];

        } else if (options) {
            // タグによる完全一致検索
            const { data, error } = await supabase
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
                if (error.code === 'PGRST116') return NextResponse.json([]);
                throw error;
            }
            rawData = data.spot_tags.map((item: any) => item.spots).filter(Boolean);
        }

        // フォーマットとソート
        let formattedData = rawData.map((item: any) => {
            const thumbnail = item.assets?.find((a: any) => a.is_cardthumbnail === true);
            const imageSrc = thumbnail?.url || "/sampleImage.png";

            return {
                id: item.id,
                spotKind: item.place_type,
                pinKind: item.place_type === "restaurant" ? "/FoodPin.svg" : 
                         item.place_type === "sightseeing_spot" ? "/CameraPin.svg" : 
                         item.place_type === "resting_spot" ? "/ChairPin.svg" : "/GiftPin.svg",
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

        // 現在地が渡されている場合は距離でソートし、5件に絞る
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            formattedData.sort((a, b) => {
                const distA = getDistance(userLat, userLng, a.position.lat, a.position.lng);
                const distB = getDistance(userLat, userLng, b.position.lat, b.position.lng);
                return distA - distB;
            });
            formattedData = formattedData.slice(0, 5);
        }

        return NextResponse.json(formattedData);

    } catch (err) {
        console.error('Unexpected Error:', err);
        return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
    }
}
