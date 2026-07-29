# Kontrak API — Autentikasi

Dokumen ini adalah kesepakatan antara frontend dan backend untuk aplikasi **Arus**.
Frontend sudah selesai dan berjalan di atas mock yang memenuhi kontrak ini
(`lib/auth/mock.ts`). Begitu endpoint di bawah tersedia, frontend hanya mengganti
isi kelima fungsi di berkas itu — tipe, nama fungsi, dan komponen tidak berubah.

Base URL diasumsikan `/api`. Semua request dan response ber-`Content-Type: application/json`.

---

## 1. Aturan session — baca ini lebih dulu

Session **wajib** dikirim sebagai cookie, bukan di body response, bukan pula
untuk disimpan frontend.

```http
Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400
```

| Atribut | Nilai | Alasan |
|---|---|---|
| Nama | `session` | Sudah dipakai `proxy.ts` di frontend. Kalau berubah, beri tahu — ada satu konstanta yang harus ikut diubah. |
| `HttpOnly` | wajib | Menghalangi JavaScript membaca token. Tanpa ini, satu celah XSS berarti seluruh session tercuri. |
| `Secure` | wajib di production | Cookie tidak ikut terkirim lewat HTTP polos. |
| `SameSite` | `Lax` | Menahan CSRF untuk request lintas situs, tapi tetap lolos saat pengguna mengklik tautan ke aplikasi. Pakai `Strict` kalau tidak ada alur masuk dari tautan eksternal. |
| `Path` | `/` | Seluruh aplikasi butuh session. |
| `Max-Age` | 86400 (24 jam) | Sesuaikan. Kalau "Ingat saya" tidak dicentang, kirim **tanpa** `Max-Age`/`Expires` agar cookie hilang saat browser ditutup. |

**Token JANGAN dikirim di body response.** Frontend tidak menyimpannya di
localStorage maupun sessionStorage, dan tidak akan pernah. Kalau token muncul di
body, ia bisa terbaca skrip pihak ketiga.

### Catatan keamanan tentang `proxy.ts`

Frontend punya `proxy.ts` yang mengecek **keberadaan** cookie `session` untuk
mengarahkan pengguna ke halaman yang tepat. Itu murni demi pengalaman pakai.

> **Itu bukan lapisan keamanan.** Siapa pun bisa membuat cookie bernama `session`
> berisi teks sembarang lewat devtools dan lolos dari pengecekan itu. Backend
> **wajib** memverifikasi tanda tangan dan masa berlaku token di **setiap**
> request, lalu membalas `401` kalau tidak sah. Jangan pernah menganggap request
> yang sampai ke backend sudah tersaring oleh frontend.

---

## 2. Bentuk data bersama

```ts
interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string   // ISO 8601, contoh "2026-01-12T04:00:00.000Z"
}

interface Session {
  user: User
  expiresAt: string   // ISO 8601
}
```

### Bentuk galat

Semua respons galat memakai bentuk yang sama:

```json
{ "error": "INVALID_CREDENTIALS", "message": "Email atau password salah." }
```

`error` adalah kode mesin dari daftar tertutup di bawah. `message` hanya untuk
log — frontend **tidak** menampilkannya; ia memetakan sendiri `error` ke bahasa
Indonesia agar teksnya konsisten.

| Kode | HTTP | Kapan dipakai |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Email tidak terdaftar **atau** password salah. Jangan dibedakan. |
| `EMAIL_TAKEN` | 409 | Email sudah dipakai saat registrasi. |
| `USER_NOT_FOUND` | 404 | Hanya untuk endpoint terautentikasi yang datanya hilang. **Jangan** dipakai di `/auth/login` atau `/auth/forgot-password`. |
| `RATE_LIMITED` | 429 | Terlalu banyak percobaan. Sertakan header `Retry-After`. |
| `NETWORK_ERROR` | — | Tidak dikirim server. Dipakai frontend saat request gagal total. |

---

## 3. Endpoint

### POST `/auth/login`

```json
{ "email": "demo@app.com", "password": "password123", "remember": false }
```

**200** — sertakan header `Set-Cookie` sesuai bagian 1.

```json
{ "user": { "id": "usr-demo", "name": "Sasya Ardelia", "email": "demo@app.com", "createdAt": "2026-01-12T04:00:00.000Z" }, "expiresAt": "2026-07-30T01:00:00.000Z" }
```

**401** `INVALID_CREDENTIALS` · **429** `RATE_LIMITED`

> **Wajib:** email tidak terdaftar dan password salah harus menghasilkan respons
> yang **identik** — kode sama, dan idealnya waktu respons sama. Kalau keduanya
> dibedakan, penyerang bisa memakai form login untuk memetakan email mana saja
> yang punya akun di sini (enumerasi akun).

`remember: false` → kirim cookie **tanpa** `Max-Age`/`Expires`.

---

### POST `/auth/register`

```json
{ "name": "Sasya Ardelia", "email": "sasya@email.com", "password": "Rahasia123!" }
```

**201** — bentuk sama dengan login, **dan langsung kirim `Set-Cookie`**.
Pengguna tidak boleh disuruh login lagi setelah mendaftar.

**409** `EMAIL_TAKEN` · **429** `RATE_LIMITED`

Validasi yang sudah ditegakkan frontend, dan **wajib diulang di server** karena
validasi klien bisa dilewati: nama 2–50 karakter, email format valid, password
minimal 8 karakter. Email disimpan lowercase dan unik.

---

### POST `/auth/logout`

Tanpa body.

**204** — sertakan header yang menghapus cookie:

```http
Set-Cookie: session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```

Kalau session disimpan di server (bukan JWT stateless), **hapus juga catatannya
di server**. Menghapus cookie saja tidak membatalkan token yang mungkin sudah
tersalin di tempat lain.

---

### GET `/auth/me`

Tanpa body. Dipakai frontend saat memuat ulang halaman untuk memulihkan session.

**200** — bentuk `Session` seperti di login.
**401** — tanpa body galat, cukup status. Frontend membacanya sebagai "belum masuk".

---

### POST `/auth/forgot-password`

```json
{ "email": "demo@app.com" }
```

**200** — selalu, dengan body kosong `{}`.

> **Wajib:** balas **200 untuk email apa pun**, terdaftar maupun tidak. Jangan
> pernah mengembalikan `USER_NOT_FOUND` di sini. Frontend memang selalu
> menampilkan pesan yang sama ("kalau email tersebut terdaftar, tautan sudah
> dikirim") — tapi kalau server membedakan status atau waktu responsnya,
> penyamaran itu bocor dan endpoint ini berubah jadi alat pemeriksa keanggotaan.

**429** `RATE_LIMITED` — batasi per email **dan** per IP.

Tautan reset sebaiknya berlaku singkat (±1 jam, teks di UI sudah menyebut angka
ini) dan hanya sekali pakai.

---

## 4. Yang masih dibutuhkan frontend

Belum ada di kontrak ini karena halamannya belum dibuat:

- `POST /auth/reset-password` — menukar token dari email dengan password baru.
- Kebijakan perpanjangan session (refresh token atau sliding expiration).

Beri tahu kalau salah satunya sudah dirancang, agar halamannya bisa menyusul.
