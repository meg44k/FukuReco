// 1時間キャッシュ
export const revalidate = 3600;

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
                ),
                restaurants (
                    avg_lunch_budget,
                    avg_dinner_budget
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

        // restaurantsテーブルのデータを取得
        const restaurantDetail = Array.isArray(data.restaurants) 
            ? data.restaurants[0] 
            : data.restaurants;

        // Google Places API (New) から営業状況を取得 (resting_spot 以外)
        let isOpen: boolean | null = null;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const referer = new URL(request.url).origin;

        if (apiKey && data.name && data.latitude && data.longitude && data.place_type !== 'resting_spot') {
            isOpen = false; // API取得前のデフォルトをfalseに設定
            try {
                const placesResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apiKey,
                        'X-Goog-FieldMask': 'places.id,places.currentOpeningHours.openNow',
                        'Referer': referer,
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
                    if (placesData && placesData.places && placesData.places.length > 0) {
                        // currentOpeningHours.openNow があればそれを使用、なければデフォルトfalse
                        isOpen = placesData.places[0].currentOpeningHours?.openNow ?? false;
                    }
                }
            } catch (placesError) {
                console.warn('Google Places API fetch failed:', placesError);
            }
        }

        // place_type に基づいて pin画像 と 詳細URL を決定
        const type = data.place_type.toLowerCase();
        let pinKind = "/FoodPin.svg";
        let detailURL = `/spots/restaurant/${data.id}`;

        if (type === "cafe" || type === "resting_spot") {
            pinKind = "/ChairPin.svg";
            detailURL = type === "cafe" ? `/spots/restaurant/${data.id}` : `/spots/resting/${data.id}`;
        } else if (type === "sightseeing" || type === "sightseeing_spot") {
            pinKind = "/CameraPin.svg";
            detailURL = `/spots/sightseeing/${data.id}`;
        } else if (type === "shop" || type === "gift_spot") {
            pinKind = "/GiftPin.svg";
            detailURL = `/spots/shop/${data.id}`;
        }

        // MapSpotData (UI用) の形式に整形
        const formattedData = {
            id: data.id,
            spotKind: data.place_type.toLowerCase(),
            pinKind: pinKind,
            spotName: data.name,
            isOpen: isOpen,
            imageSrc: imageSrc,
            spotTags: (data.spot_tags as unknown as { tags: { detail: string }[] | { detail: string } | null }[] | null)?.map((st) => {
                const tags = st.tags;
                if (Array.isArray(tags)) return tags[0]?.detail;
                return (tags as { detail: string } | null)?.detail;
            }).filter(Boolean) || [],
            detailURL: detailURL,
            price1: restaurantDetail?.avg_lunch_budget || (typeof data.pricing === 'string' ? data.pricing : "価格情報なし"),
            price2: restaurantDetail?.avg_dinner_budget || "",
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
