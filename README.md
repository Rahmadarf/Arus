# Arus: High-Performance Financial Management System

> Arus adalah aplikasi manajemen finansial yang dirancang untuk memberikan **integritas data absolut**, keamanan tingkat tinggi, dan skalabilitas jangka panjang. 

Berbeda dengan aplikasi konvensional yang mengandalkan kalkulasi logika sisi klien (*client-side*), Arus mengadopsi arsitektur *database-driven* di mana seluruh integritas saldo dan transaksi dikelola langsung di level **PostgreSQL**. Pendekatan ini memastikan bahwa data finansial kamu konsisten, akurat, dan terlindungi, terlepas dari bagaimana antarmuka pengguna diakses.

---

## 🚀 Fitur Utama

### Pengalaman Pengguna (UX)
*   **Real-time Finance Tracking**: Catat transaksi dengan efisiensi tinggi menggunakan antarmuka yang responsif.
*   **Data Visualization**: Pantau tren arus kas bulanan melalui grafik interaktif yang dinamis.
*   **Smart Filtering**: Navigasi data transaksi yang kompleks secara *instant* berdasarkan kategori, rentang waktu, atau deskripsi tanpa *page reload*.
*   **Professional Reporting**: Ekspor laporan keuangan ke format PDF secara instan untuk kebutuhan dokumentasi.
*   **Adaptive Theme**: Antarmuka yang ramah mata dengan dukungan *system-wide* Dark/Light mode.
*   **Auto-Onboarding**: Sistem *seeding* kategori otomatis yang cerdas bagi pengguna baru.

### Keunggulan Arsitektural
*   **Zero-Latency Balance Calculation**: Memanfaatkan *PostgreSQL Database Triggers* untuk pembaruan saldo otomatis secara *real-time*. Komputasi saldo dipindahkan dari aplikasi ke *database*, memastikan performa tetap konstan $O(1)$ meski data transaksi mencapai jutaan baris.
*   **Strict Financial Integrity**: Implementasi *Check Constraints* pada level *database* untuk menjamin saldo tidak pernah bernilai negatif, mencegah *race condition* yang lazim terjadi pada aplikasi finansial.
*   **Zero-Trust Security**: Proteksi penuh menggunakan *Middleware* untuk autentikasi rute, serta implementasi *Row Level Security* (RLS) untuk menjamin isolasi data antar pengguna secara mutlak.
*   **Type-Safe & Scalable**: Dibangun menggunakan Next.js (App Router), TypeScript, dan Supabase untuk alur kerja pengembangan yang efisien dengan pemisahan *Client* dan *Server Components* yang ketat.

---

## 🛠 Tech Stack

Aplikasi ini dibangun menggunakan *cutting-edge technology*:

*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **PDF Generation**: [jsPDF](https://jspdf.com/) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

---

## 🏗 Arsitektur Sistem

Arus mengutamakan **Server-Side Rendering (SSR)** untuk performa maksimal dan keamanan data. Seluruh logika transaksi diproses melalui *Server Actions* untuk menjamin konsistensi data. Dengan mengandalkan kebijakan *Row Level Security* (RLS) di sisi database, aplikasi ini memastikan setiap pengguna hanya memiliki akses terhadap datanya sendiri, menjadikan sistem ini tangguh terhadap akses tidak sah.
