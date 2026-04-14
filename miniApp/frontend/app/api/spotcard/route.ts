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

        // Google Places API (New) から営業状況を取得 (resting_spot 以外)
        let isOpen: boolean | null = null;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (apiKey && data.name && data.latitude && data.longitude && data.place_type !== 'resting_spot') {
            isOpen = false; // API取得前のデフォルトをfalseに設定
            try {
                const placesResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apiKey,
                        'X-Goog-FieldMask': 'places.id,places.currentOpeningHours.openNow',
                    },
                    body: JSON.stringify({
                        textQuery: data.name,
                        locationBias: {
                            circle: {
                                center: {
                                    latitude: parseFloat(data.latitude),
                                    longitude: parseFloat(data.longitude),
                                },
                                radius: 500.0,
                            },
                        },
                        maxResultCount: 1,
                    }),
                });

                if (placesResponse.ok) {
                    const placesData = await placesResponse.json();
                    if (placesData.places && placesData.places.length > 0) {
                        // currentOpeningHours.openNow があればそれを使用、なければデフォルトfalse
                        isOpen = placesData.places[0].currentOpeningHours?.openNow ?? false;
                    }
                }
            } catch (placesError) {
                console.warn('Google Places API fetch failed:', placesError);
            }
        }

        // MapSpotData (UI用) の形式に整形
        const formattedData = {
            id: data.id,
            spotKind: data.place_type,
            // 本来はカテゴリ等から判定するが、一旦共通のパスをセット（フロントエンドで上書き可能）
            pinKind: data.place_type === "restaurant" ? "/FoodPin.svg" : "/CameraPin.svg",
            spotName: data.name,
            isOpen: isOpen,
            imageSrc: imageSrc,
            spotTags: (data.spot_tags as unknown as { tags: { detail: string }[] | { detail: string } | null }[] | null)?.map((st) => {
                const tags = st.tags;
                if (Array.isArray(tags)) return tags[0]?.detail;
                return (tags as { detail: string } | null)?.detail;
            }).filter(Boolean) || [],
            detailURL: `/spots/restaurant/${data.id}`,
            price1: typeof data.pricing === 'string' ? data.pricing : "価格情報なし", // pricingの形式に合わせて調整が必要
            position: {
                lat: parseFloat(data.latitude),
                lng: parseFloat(data.longitude)
            },
            updatedAt: new Date(data.updated_at)
        };

        return NextResponse.json(formattedData);

    } catch (err) {
        console.error('Unexpected Error:', err);
        return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
    }
}
