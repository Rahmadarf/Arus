import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/goals')) {
    const url = new URL('/coming-soon', request.url)
    url.searchParams.set('message', 'maintenance')

    return NextResponse.redirect(url)
  }

  // 2. Jalankan sesi Supabase untuk halaman lainnya
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
