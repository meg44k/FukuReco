import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';


// サーバ側(Server Components)でsupabaseに接続するためのクライアントを作成する関数
// LINEログイン機能を導入した場合などを想定して、Cookieの読み書きの機能を実装してます
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Cookie読み込み
        getAll() {
          return cookieStore.getAll()
        },
        // Cookie書き込み
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ここはServer Componentから呼び出された際のエラー回避用のおまじないです
          }
        },
      },
    }
  );
}
