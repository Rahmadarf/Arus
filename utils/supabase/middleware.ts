import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Buat response awal yang akan dimodifikasi jika ada token baru
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Perbarui cookie pada request agar getUser() membaca data terbaru
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Sinkronisasi ulang response agar browser pengguna menerima cookie terbaru
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Eksekusi pemanggilan ini krusial. Ini yang memicu refresh token jika kedaluwarsa.
  const { data: { user } } = await supabase.auth.getUser()

  // Definisi rute publik yang tidak memerlukan autentikasi
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')

  // Logika Pertahanan Rute
  if (!user && !isAuthPage) {
    // Menendang penyusup ke halaman login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    // Mencegah user yang sudah login mengakses form login kembali
    const url = request.nextUrl.clone()
    url.pathname = '/' // Asumsi rute utama dashboard kamu
    return NextResponse.redirect(url)
  }

  // Wajib mengembalikan supabaseResponse, BUKAN sekadar NextResponse.next()
  return supabaseResponse
}