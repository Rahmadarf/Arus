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

---

# Kontrak API — Pengaturan Akun

Bagian ini melengkapi bagian autentikasi di atas. Dipakai oleh halaman
`/settings` (tab Profil, Keamanan, Preferensi, Zona Bahaya).

Semua endpoint di sini **wajib terautentikasi**. Identitas pengguna diambil dari
cookie `session`, **bukan** dari `userId` di body — jangan pernah menerima id
pengguna dari klien untuk endpoint ini.

## 5. Kode galat tambahan

| Kode | HTTP | Kapan dipakai |
|---|---|---|
| `WRONG_CURRENT_PASSWORD` | 401 | Password saat ini tidak cocok pada `POST /user/password`. Frontend menempelkan pesan ini ke field "Password Saat Ini", jadi kodenya harus spesifik — jangan pakai `INVALID_CREDENTIALS`. |
| `EMAIL_TAKEN` | 409 | Email tujuan sudah dipakai akun lain. Sudah ada di bagian auth, dipakai ulang di sini. |
| `WEAK_PASSWORD` | 422 | Password baru tidak memenuhi kebijakan server. |

## 6. Bentuk data tambahan

```ts
interface UserProfile {
  name: string
  email: string
  avatarUrl: string | null
}

interface AppPreferences {
  theme: 'light' | 'dark' | 'system'
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy'
}
```

Preferensi disimpan **di server**, bukan di localStorage. Alasannya: kalau
disimpan di perangkat, pengguna yang membuka aplikasi dari HP dan laptop akan
melihat setelan berbeda tanpa tahu kenapa.

## 7. Endpoint

### GET `/user/profile`

Mengembalikan profil pengguna dari session.

**Respons 200**

```json
{ "name": "Sasya Ardelia", "email": "demo@app.com", "avatarUrl": null }
```

---

### PATCH `/user/profile`

**Request**

```json
{ "name": "Sasya Ardelia", "email": "demo@app.com" }
```

Keduanya opsional; kirim hanya yang berubah.

**Respons 200** — profil setelah diperbarui, bentuknya sama dengan `GET`.

**Galat**

| Kondisi | Kode |
|---|---|
| Email sudah dipakai akun lain | `EMAIL_TAKEN` (409) |

> **KEPUTUSAN YANG DIBUTUHKAN — verifikasi email.**
> Di frontend, mengubah email saat ini langsung dianggap sukses, dan pengguna
> diberi tahu lewat `<Alert>` bahwa production akan memerlukan verifikasi ulang.
>
> Tolong putuskan alurnya, karena bentuk responsnya berubah:
> - **Kalau butuh verifikasi:** jangan langsung mengganti email. Kembalikan
>   `202` dengan `{ "pendingEmail": "baru@app.com" }`, kirim tautan ke email
>   baru, dan sediakan `POST /user/email/confirm`. Beri tahu supaya UI-nya
>   diubah jadi status "menunggu konfirmasi".
> - **Kalau tidak:** cukup `200` seperti di atas, dan alert itu dihapus.

---

### POST `/user/avatar`

**Belum dipakai frontend.** Saat ini penggantian avatar hanya pratinjau lokal
lewat `URL.createObjectURL` dan tidak diunggah ke mana pun.

Yang dibutuhkan saat siap: `multipart/form-data` dengan field `file`.

**Respons 200**

```json
{ "avatarUrl": "https://cdn.example.com/avatar/usr-demo.webp" }
```

Batas yang sudah divalidasi di klien — **wajib diperiksa ulang di server**,
karena validasi klien bisa dilewati:

- `Content-Type` diawali `image/`
- Ukuran maksimal 2 MB

---

### POST `/user/password`

**Request**

```json
{ "currentPassword": "...", "newPassword": "..." }
```

**Respons 204** — tanpa body.

**Galat**

| Kondisi | Kode |
|---|---|
| Password saat ini salah | `WRONG_CURRENT_PASSWORD` (401) |
| Password baru tidak memenuhi kebijakan | `WEAK_PASSWORD` (422) |
| Terlalu banyak percobaan | `RATE_LIMITED` (429) |

Catatan:

- Kebijakan minimal frontend adalah 8 karakter. Kalau server lebih ketat,
  kirim `WEAK_PASSWORD` dan beri tahu aturannya agar pesannya bisa disamakan.
- **Sarankan mencabut session lain** setelah password diganti. Kalau itu
  dilakukan, beri tahu — frontend perlu menjelaskannya ke pengguna, karena
  perangkat lain akan tiba-tiba logout.

---

### GET `/user/preferences` dan PATCH `/user/preferences`

**Request PATCH** — kirim hanya yang berubah.

```json
{ "dateFormat": "mm/dd/yyyy" }
```

**Respons 200** — seluruh preferensi setelah diperbarui.

```json
{ "theme": "system", "dateFormat": "dd/mm/yyyy" }
```

Tab Preferensi memakai simpan-otomatis, jadi endpoint ini dipanggil setiap kali
pengguna mengubah satu pilihan. Buat idempoten dan ringan.

Mata uang **tidak** ada di kontrak ini. `formatRupiah` di `lib/format.ts`
mengunci `id-ID` dan `IDR`, jadi halaman menampilkannya sebagai teks statis.
Jangan tambahkan field mata uang sebelum formatter di frontend disiapkan.

---

### DELETE `/user/account`

Endpoint paling merusak di seluruh aplikasi.

**Request**

```json
{ "confirmation": "HAPUS AKUN" }
```

**Respons 204** — tanpa body. Server **wajib** menghapus cookie session di
respons yang sama (`Set-Cookie` dengan `Max-Age=0`).

**Galat**

| Kondisi | Kode |
|---|---|
| `confirmation` tidak sama persis dengan `HAPUS AKUN` | 400 |

Yang wajib dipenuhi:

1. **Periksa ulang `confirmation` di server.** UI sudah menonaktifkan tombol
   sampai teksnya cocok, tapi aksi sepermanen ini tidak boleh hanya bergantung
   pada UI.
2. **Hapus datanya, bukan cuma akunnya.** Seluruh transaksi dan kategori milik
   pengguna ikut terhapus — itu yang dijanjikan dialog konfirmasi kepada
   pengguna: *"Seluruh transaksi, kategori, dan data akun akan dihapus permanen
   dan tidak bisa dikembalikan."*
3. **Putuskan soal penghapusan bertunda.** Kalau kamu memilih soft delete
   dengan tenggang (misalnya 30 hari), teks dialog itu jadi tidak benar dan
   harus saya ubah. Beri tahu kalau begitu rencananya.

---

## 8. Yang masih dibutuhkan frontend dari bagian ini

- Keputusan alur verifikasi email pada `PATCH /user/profile`.
- Keputusan hard delete vs soft delete pada `DELETE /user/account`.
- Aturan kebijakan password server, agar pesan `WEAK_PASSWORD` bisa spesifik.
- Konfirmasi apakah `POST /user/password` mencabut session lain.
