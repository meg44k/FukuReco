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
        const placeType = searchParams.get('type');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const limit = parseInt(searchParams.get('limit') || '5', 10);

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
        if (!options && !keyword && !placeType) {
            return NextResponse.json([], { status: 200 });
        }

        type SpotAsset = { url: string; is_cardthumbnail: boolean };
        type SpotTag = { tags: { detail: string } };
        type RawSpot = {
            id: number;
            name: string;
            place_type: string;
            pricing?: string | null;
            latitude: number | string;
            longitude: number | string;
            updated_at: string;
            spot_tags?: SpotTag[];
            assets?: SpotAsset[];
            restaurants?: {
                avg_lunch_budget?: string;
                avg_dinner_budget?: string;
            } | {
                avg_lunch_budget?: string;
                avg_dinner_budget?: string;
            }[];
        };

        let rawData: RawSpot[] = [];

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
                    ),
                    restaurants (
                        avg_lunch_budget,
                        avg_dinner_budget
                    )
                `)
                .or(`name.ilike.%${keyword}%,catchphrase.ilike.%${keyword}%,fukureko_comment.ilike.%${keyword}%`);

            if (error) throw error;
            rawData = (data as unknown as RawSpot[]) || [];

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
                            ),
                            restaurants (
                                avg_lunch_budget,
                                avg_dinner_budget
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
            rawData = (data.spot_tags as unknown as { spots: RawSpot }[]).map((item) => item.spots).filter(Boolean);
        } else if (placeType) {
            // place_type による検索
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
                .eq('place_type', placeType);

            if (error) throw error;
            rawData = (data as unknown as RawSpot[]) || [];
        }

        // フォーマットとソート
        let formattedData = rawData.map((item: RawSpot) => {
            const thumbnail = item.assets?.find((a: SpotAsset) => a.is_cardthumbnail === true);
            const imageSrc = thumbnail?.url || "/sampleImage.png";

            // restaurantsテーブルのデータを取得
            const restaurantDetail = Array.isArray(item.restaurants) 
                ? item.restaurants[0] 
                : item.restaurants;

            // place_type に基づいて pin画像 と 詳細URL を決定
            const type = item.place_type.toLowerCase();
            let pinKind = "/FoodPin.svg";
            let detailURL = `/spots/restaurant/${item.id}`;

            if (type === "cafe" || type === "resting_spot") {
                pinKind = "/ChairPin.svg";
                detailURL = type === "cafe" ? `/spots/restaurant/${item.id}` : `/spots/resting/${item.id}`;
            } else if (type === "sightseeing" || type === "sightseeing_spot") {
                pinKind = "/CameraPin.svg";
                detailURL = `/spots/sightseeing/${item.id}`;
            } else if (type === "shop" || type === "gift_spot") {
                pinKind = "/GiftPin.svg";
                detailURL = `/spots/shop/${item.id}`;
            }

            return {
                id: item.id,
                spotKind: item.place_type.toLowerCase(),
                pinKind: pinKind,
                spotName: item.name,
                imageSrc: imageSrc,
                spotTags: item.spot_tags?.map((st: SpotTag) => st.tags?.detail).filter(Boolean) || [],
                detailURL: detailURL,
                price1: restaurantDetail?.avg_lunch_budget || (typeof item.pricing === 'string' ? item.pricing : "価格情報なし"),
                price2: restaurantDetail?.avg_dinner_budget || "",
                position: {
                    lat: typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude,
                    lng: typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude
                },
                updatedAt: new Date(item.updated_at)
            };
        });

        // 現在地が渡されている場合は距離でソートし、指定件数に絞る
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            formattedData.sort((a, b) => {
                const distA = getDistance(userLat, userLng, a.position.lat, a.position.lng);
                const distB = getDistance(userLat, userLng, b.position.lat, b.position.lng);
                return distA - distB;
            });
            formattedData = formattedData.slice(0, limit);
        }

        // 各スポットの営業状況を Google Places API (New) から取得 (上位のみ)
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        // リクエストURLからリファラーのオリジンを取得 (localhost や app.fukureco.jp)
        const referer = new URL(request.url).origin;

        if (apiKey && formattedData.length > 0) {
            // 通信量とクォータを考慮し、既に絞り込まれた上位数件のみ取得
            // 距離ソートされていない場合（現在地なし）でも、指定件数に制限
            const targetData = formattedData.slice(0, limit);
            
            const resultsWithOpenStatus = await Promise.all(targetData.map(async (spot) => {
                let isOpen: boolean | null = null;
                
                // resting_spot 以外の場合のみ営業状況を取得
                if (spot.spotKind !== 'resting_spot') {
                    isOpen = false;
                    try {
                        const placesResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Goog-Api-Key': apiKey,
                                'X-Goog-FieldMask': 'places.currentOpeningHours.openNow',
                                'Referer': referer, // APIキーの制限を通過するためにリファラーを明示的に付与
                            },
                            body: JSON.stringify({
                                textQuery: spot.spotName,
                                locationBias: {
                                    circle: {
                                        center: {
                                            latitude: spot.position.lat,
                                            longitude: spot.position.lng,
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
                                isOpen = placesData.places[0].currentOpeningHours?.openNow ?? false;
                            }
                        }
                    } catch (e) {
                        console.warn(`Places API failed for ${spot.spotName}:`, e);
                    }
                }
                return { ...spot, isOpen };
            }));

            return NextResponse.json(resultsWithOpenStatus);
        }

        return NextResponse.json(formattedData);

    } catch (err) {
        console.error('Unexpected Error:', err);
        return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
    }
}