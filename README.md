# TrackFlow - Personal Finance Tracker

TrackFlow adalah aplikasi pelacak keuangan personal yang dibangun dengan arsitektur modern untuk efisiensi, kecepatan, dan ketajaman visual. Aplikasi ini membantu pengguna mencatat pemasukan dan pengeluaran secara terstruktur dengan visualisasi data yang intuitif.

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
