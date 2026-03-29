import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // すべてのリクエストに対しセッションを更新・確認
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 以下のパスを除外する:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * 
     * /admin 配下のみでなく、全体に適用させることでセッションが最新であることを保証します
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
