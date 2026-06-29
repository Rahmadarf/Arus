# BukuKu - Personal Finance Tracker

BukuKu adalah aplikasi pelacak keuangan personal yang dibangun dengan arsitektur modern untuk efisiensi, kecepatan, dan ketajaman visual. Aplikasi ini membantu pengguna mencatat pemasukan dan pengeluaran secara terstruktur dengan visualisasi data yang intuitif.

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

## 📦 Instalasi
Untuk menjalankan proyek ini secara lokal:

1. Clone repositori:
   ```bash
   git clone [https://github.com/username/bukuku.git](https://github.com/username/bukuku.git)
   cd bukuku
Instal dependensi:

Bash
npm install
Konfigurasi environment variables (.env.local):

Cuplikan kode
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
Jalankan server pengembangan:

Bash
npm run dev
📊 Roadmap Masa Depan
[ ] Budget & Limit Management per kategori.

[ ] Recurring Transaction (Reminder otomatis).

[ ] Multi-account/Multi-wallet support.

👨‍💻 Kontributor
Rahmad Arifin Susilo - Fullstack Web Developer

Proyek ini merupakan implementasi praktik terbaik dalam pengembangan aplikasi web modern.


---

### Tips Profesional untuk GitHub-mu:
1. **Ganti Placeholder:** Pastikan kamu mengubah `username/bukuku` di bagian `git clone` menjadi URL repositori aslimu.
2. **Screenshot:** Tambahkan satu atau dua tangkapan layar (screenshot) aplikasi yang sudah jadi tepat setelah bagian "Fitur Utama". Kamu bisa menaruh file gambar di folder `/public`, lalu menambahkannya di markdown dengan sintaks: `![Dashboard Screenshot](/dashboard.png)`. Visual jauh lebih menjual daripada teks.
3. **Commit yang Disiplin:** Jangan lakukan `git push` dengan pesan "update". Gunakan konvensi sepe
