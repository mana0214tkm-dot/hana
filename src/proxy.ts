import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthConfigured, SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

// AUTH_PASSWORD が設定されている場合のみ、パスコード認証を強制する。
// 未設定時(ローカル開発でパスワードを用意していない場合)は従来通り誰でもアクセス可能。
export function proxy(request: NextRequest) {
  if (!isAuthConfigured()) return NextResponse.next()

  const { pathname } = request.nextUrl
  if (pathname === '/login' || pathname === '/api/auth/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (verifySessionToken(token)) return NextResponse.next()

  if (pathname.startsWith('/api')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
