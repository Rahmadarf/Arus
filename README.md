# Arus: High-Performance Financial Management System

Arus adalah aplikasi manajemen finansial yang dibangun dengan fokus pada integritas data, keamanan, dan skalabilitas. Berbeda dengan aplikasi serupa yang mengandalkan kalkulasi sisi klien, FinStream mengadopsi arsitektur database-driven di mana seluruh logika saldo dan transaksi dikelola langsung di level PostgreSQL.Fitur Arsitektural Utama:Zero-Latency Balance Calculation: Menggunakan PostgreSQL Database Triggers untuk pembaruan saldo otomatis secara instan. Perhitungan beban komputasi dipindahkan dari aplikasi ke database, memastikan performa tetap konstan $O(1)$ meski data transaksi mencapai jutaan baris.Strict Financial Integrity: Implementasi Check Constraints pada level database untuk memastikan saldo tidak pernah bernilai negatif, menjamin ketahanan sistem dari race condition.Security-First Design: Proteksi penuh menggunakan Middleware untuk autentikasi rute, serta implementasi Row Level Security (RLS) untuk menjamin isolasi data antar pengguna secara mutlak.Type-Safe & Scalable: Dibangun menggunakan Next.js (App Router), TypeScript, dan Supabase untuk alur kerja pengembangan yang efisien dengan pemisahan Client dan Server Components yang ketat.

## 🚀 Fitur Utama
- **Real-time Finance Tracking**: Catat transaksi dengan mudah menggunakan antarmuka yang responsif.
- **Data Visualization**: Pantau tren arus kas bulanan melalui grafik interaktif yang dinamis.
- **Smart Filtering**: Cari dan filter transaksi berdasarkan kategori, bulan, tahun, atau deskripsi tanpa *reload* halaman.
- **Professional Export**: Ekspor laporan keuangan ke format PDF secara instan untuk kebutuhan dokumentasi.
- **Dark/Light Mode**: Antarmuka yang ramah mata dengan dukungan *system theme*.
- **Auto-Onboarding**: Sistem *seeding* kategori otomatis bagi pengguna baru.

## 🛠 Tech Stack
Aplikasi ini dibangun menggunakan *cutting-edge technology*:
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **PDF Generation**: [jsPDF](https://jspdf.com/) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

## 🏗 Arsitektur
Aplikasi ini mengutamakan **Server-Side Rendering (SSR)** untuk performa maksimal dan keamanan data. Seluruh logika transaksi diproses melalui *Server Actions* untuk menjamin konsistensi data dan keamanan *Row Level Security* (RLS) di sisi database.
