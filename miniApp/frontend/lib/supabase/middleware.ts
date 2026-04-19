import { NextResponse, type NextRequest } from 'next/server'

/**
 * セッションの更新処理を行うミドルウェア
 * 現在、ログイン機能は一時的にオフ（ゲストログイン優先）となっており、
 * 管理画面（/admin）の制御も別管理となったため、ここでは標準的なレスポンス返却のみを行います。
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  // メモ: 今後、一般ユーザー向けのセッション維持が必要になった場合は、
  // ここで supabase.auth.getUser() を呼び出す処理を復活させてください。

  return supabaseResponse
}
