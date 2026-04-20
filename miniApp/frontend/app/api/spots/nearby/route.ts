import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 定数定義
const RADIUS = 0.05; // 約5km範囲
const DISPLAY_LIMIT = 5;

interface SpotRow {
    id: number;
    name: string;
    place_type: string;
    latitude: string | number;
    longitude: string | number;
    spot_tags: { tags: { detail: string } | { detail: string }[] | null }[];
    assets: { url: string; is_cardthumbnail: boolean }[];
}

// place_type から詳細URLのサブパスを決定するマップ
const TYPE_MAP: Record<string, string> = {
    resting_spot: 'resting',
    sightseeing: 'sightseeing',
    sightseeing_spot: 'sightseeing',
    shop: 'shop',
    gift_spot: 'shop',
};

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        
        const latStr = searchParams.get('lat');
        const lngStr = searchParams.get('lng');
        const currentIdStr = searchParams.get('currentId');

        if (!latStr || !lngStr) {
            return NextResponse.json({ error: '緯度経度が指定されていません' }, { status: 400 });
        }

        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lngStr);
        const currentId = currentIdStr && currentIdStr !== 'undefined' ? parseInt(currentIdStr, 10) : null;
        
        if (isNaN(latitude) || isNaN(longitude)) {
            return NextResponse.json({ error: '無効な座標です' }, { status: 400 });
        }

        // DB側で範囲を絞り込む (Bounding Box)
        let query = supabase
            .from('spots')
            .select(`
                id,
                name,
                place_type,
                latitude,
                longitude,
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
            .gte('latitude', latitude - RADIUS)
            .lte('latitude', latitude + RADIUS)
            .gte('longitude', longitude - RADIUS)
            .lte('longitude', longitude + RADIUS)
            .limit(DISPLAY_LIMIT + 1); // currentId除外分を考慮

        if (currentId !== null && !isNaN(currentId)) {
            query = query.neq('id', currentId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
        }

        const formattedSpots = (data as unknown as SpotRow[] || []).map((spot) => {
            const thumbnail = spot.assets?.find((a) => a.is_cardthumbnail);
            const imageSrc = thumbnail?.url || "/sampleImage.png";

            // URL生成
            const typeKey = (spot.place_type || "").toLowerCase();
            const subPath = TYPE_MAP[typeKey] || 'restaurant';
            const detailURL = `/spots/${subPath}/${spot.id}`;

            // タグ取得（ネストを安全に処理）
            const tags = spot.spot_tags?.map((st) => {
                if (!st.tags) return null;
                if (Array.isArray(st.tags)) return st.tags[0]?.detail;
                return st.tags.detail;
            }).filter((t): t is string => !!t) || [];

            return {
                id: spot.id,
                spotKind: spot.place_type,
                spotName: spot.name,
                imageSrc: imageSrc,
                spotTags: tags,
                detailURL: detailURL,
            };
        }).slice(0, DISPLAY_LIMIT);

        return NextResponse.json(formattedSpots);

    } catch (err) {
        console.error('Unexpected Error:', err);
        return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
    }
}
