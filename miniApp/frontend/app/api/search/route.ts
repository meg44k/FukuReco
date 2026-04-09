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
                    pricing,
                    latitude,
                    longitude,
                    spot_tags (
                        tags (
                            detail 
                        )
                    )
                `)
                .or(`name.ilike.%${keyword}%,catchphrase.ilike.%${keyword}%,fukureko_comment.ilike.%${keyword}%`);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            // mapでjsonを展開
            const formattedData = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                pricing: item.pricing,
                latitude: parseFloat(item.latitude),
                longitude: parseFloat(item.longitude),
                tags: item?.spot_tags?.map((st: any) => st.tags?.detail).filter(Boolean) || []
            }));

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
                            pricing,
                            latitude,
                            longitude,
                            spot_tags (
                                tags (
                                    detail 
                                )
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
                    return {
                        id: temp?.id,
                        name: temp?.name,
                        pricing: temp?.pricing,
                        latitude: parseFloat(temp?.latitude),
                        longitude: parseFloat(temp?.longitude),
                        tags: temp?.spot_tags?.map((st: any) => st.tags?.detail).filter(Boolean) || []
                    };
                });

            return NextResponse.json(formattedData);
        }

    } catch (err) {
        console.error('Unexpected Error:', err);
        return NextResponse.json({ error: 'サーバー内部エラーが発生しました' }, { status: 500 });
    }
}
