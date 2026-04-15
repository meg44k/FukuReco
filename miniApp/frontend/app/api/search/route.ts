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
        }

        // フォーマットとソート
        let formattedData = rawData.map((item: RawSpot) => {
            const thumbnail = item.assets?.find((a: SpotAsset) => a.is_cardthumbnail === true);
            const imageSrc = thumbnail?.url || "/sampleImage.png";

            return {
                id: item.id,
                spotKind: item.place_type,
                pinKind: item.place_type === "restaurant" ? "/FoodPin.svg" : 
                         item.place_type === "sightseeing_spot" ? "/CameraPin.svg" : 
                         item.place_type === "resting_spot" ? "/ChairPin.svg" : "/GiftPin.svg",
                spotName: item.name,
                imageSrc: imageSrc,
                spotTags: item.spot_tags?.map((st: SpotTag) => st.tags?.detail).filter(Boolean) || [],
                detailURL: `/spots/restaurant/${item.id}`,
                price1: typeof item.pricing === 'string' ? item.pricing : "価格情報なし",
                position: {
                    lat: typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude,
                    lng: typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude
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

        // 各スポットの営業状況を Google Places API (New) から取得 (上位のみ)
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (apiKey && formattedData.length > 0) {
            // 通信量とクォータを考慮し、既に絞り込まれた上位数件のみ取得
            // 距離ソートされていない場合（現在地なし）でも、念のため最初の5件に制限
            const targetData = formattedData.slice(0, 5);
            
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