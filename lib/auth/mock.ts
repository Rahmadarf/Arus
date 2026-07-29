import {
  AuthFailure,
  SESSION_COOKIE,
  type Session,
  type User,
} from "@/lib/auth/types";

// ============================================================================
// MOCK AUTH — SATU-SATUNYA BERKAS YANG BERUBAH SAAT BACKEND SIAP.
//
// ATURAN PENYIMPANAN SESSION:
// Session ditiru lewat cookie bernama 'session', BUKAN localStorage atau
// sessionStorage. Alasannya dua:
//
// 1. localStorage bisa dibaca skrip mana pun di halaman — satu celah XSS
//    berarti token dicuri. Cookie httpOnly asli nanti tidak bisa dibaca JS.
// 2. Kalau sekarang memakai localStorage, saat backend siap kita bukan cuma
//    mengganti sumber data, tapi juga mengganti model keamanan — termasuk
//    proxy.ts, yang membaca cookie dan tidak bisa melihat localStorage.
//
// Cookie di sini non-httpOnly karena ditulis dari JS. Saat backend siap,
// SERVER yang menuliskannya dengan httpOnly + secure + sameSite, dan seluruh
// baris document.cookie di bawah ini dihapus.
//
// PASSWORD tidak pernah disimpan, di-cache, maupun dicatat di mana pun.
// ============================================================================

const LATENCY_MS = 800;

/** Naikkan untuk menguji error state. 0 = selalu berhasil. */
const FAILURE_RATE = 0.1;

const SESSION_TTL_HOURS = 24;

// HAPUS sebelum production — akun demo khusus fase mock.
export const DEMO_EMAIL = "demo@app.com";
export const DEMO_PASSWORD = "password123";

const DEMO_USER: User = {
  id: "usr-demo",
  name: "Sasya Ardelia",
  email: DEMO_EMAIL,
  createdAt: "2026-01-12T04:00:00.000Z",
};

/** Akun yang dibuat lewat register selama sesi browser ini. */
const registered = new Map<string, User>([[DEMO_EMAIL, DEMO_USER]]);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulateRequest() {
  await wait(LATENCY_MS);
  if (Math.random() < FAILURE_RATE) {
    throw new AuthFailure("NETWORK_ERROR");
  }
}

// ---------------------------------------------------------------------------
// Cookie helper. Nilainya dummy — bukan JWT, dan tidak boleh dianggap bukti
// apa pun. Backend nanti yang menerbitkan token asli.
// ---------------------------------------------------------------------------

function writeSessionCookie(session: Session, remember: boolean) {
  const parts = [
    `${SESSION_COOKIE}=mock-${session.user.id}`,
    "Path=/",
    "SameSite=Lax",
  ];

  // "Ingat saya" tidak dicentang -> cookie sesi, hilang saat browser ditutup.
  if (remember) parts.push(`Expires=${new Date(session.expiresAt).toUTCString()}`);

  document.cookie = parts.join("; ");
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function hasSessionCookie() {
  return document.cookie
    .split("; ")
    .some((entry) => entry.startsWith(`${SESSION_COOKIE}=`) && entry.length > SESSION_COOKIE.length + 1);
}

function buildSession(user: User): Session {
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600_000).toISOString();
  return { user, expiresAt };
}

/**
 * Pengguna aktif disimpan di memori modul, bukan di storage apa pun. Cookie
 * hanya menandakan "ada session"; isinya dipulihkan dari sini. Setelah backend
 * siap, ini diganti panggilan GET /auth/me.
 */
let currentUser: User | null = null;

// ---------------------------------------------------------------------------

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function login(
  email: string,
  password: string,
  remember = false
): Promise<Session> {
  await simulateRequest();

  const user = registered.get(email.trim().toLowerCase());

  // Password salah dan email tidak terdaftar mengembalikan kode yang sama,
  // supaya tidak bisa dipakai menebak email mana yang punya akun.
  if (!user || password !== DEMO_PASSWORD) {
    throw new AuthFailure("INVALID_CREDENTIALS");
  }

  const session = buildSession(user);
  currentUser = user;
  writeSessionCookie(session, remember);
  return session;
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function register(
  name: string,
  email: string,
  password: string
): Promise<Session> {
  await simulateRequest();

  const normalized = email.trim().toLowerCase();
  if (registered.has(normalized)) {
    throw new AuthFailure("EMAIL_TAKEN");
  }

  // `password` sengaja tidak dipakai selain sebagai penanda bahwa field ini
  // ada di kontrak. Tidak disimpan, tidak di-hash di klien, tidak dicatat.
  void password;

  const user: User = {
    id: `usr-${Date.now().toString(36)}`,
    name: name.trim(),
    email: normalized,
    createdAt: new Date().toISOString(),
  };

  registered.set(normalized, user);

  const session = buildSession(user);
  currentUser = user;
  writeSessionCookie(session, true);
  return session;
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function logout(): Promise<void> {
  await wait(200);
  currentUser = null;
  clearSessionCookie();
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function getSession(): Promise<Session | null> {
  await wait(150);

  if (!hasSessionCookie()) {
    currentUser = null;
    return null;
  }

  // Cookie ada tapi memori modul kosong (mis. setelah refresh penuh) — pulihkan
  // ke akun demo. Setelah backend siap, GET /auth/me yang menjawab ini.
  if (!currentUser) currentUser = DEMO_USER;

  return buildSession(currentUser);
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function requestPasswordReset(email: string): Promise<void> {
  await simulateRequest();

  // Sengaja tidak memeriksa apakah email terdaftar, dan tidak melempar
  // USER_NOT_FOUND. Pemanggilnya selalu menampilkan pesan sukses yang sama.
  void email;
}
