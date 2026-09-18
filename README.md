   # BazzUp

Platform yang menghubungkan UMKM pencari tempat berjualan dengan penyelenggara bazaar yang punya slot kosong. Menjawab permasalahan distribusi lowongan bazaar yang belum merata, sebagai tempat penyaluran informasi bazaar yang lebih luas. Mudah di akses dan dapat dijangkau dimana saja dan kapanpun. 

**Demo:** https://bazzup.vercel.app

---

## Masalah yang Diselesaikan

Ada jutaan UMKM di Indonesia yang punya produk bagus tapi tidak punya tempat berjualan dan kesempatan untuk mempromosikan bandnya. Di sisi lain, ratusan bazaar digelar setiap bulan dengan slot yang sulit untuk terisi penuh. 

Masalahnya bukan sekadar mempertemukan keduanya, vendor sering rugi karena menyewa slot di area yang salah. BazzUp menghitung **Match Score** yang mencocokkan karakter usaha vendor dengan karakter area bazaar, sehingga keputusan sewa jadi terukur, bukan tebak-tebakan. BazzUp membantu penyebaran informasi merata sehingga lebih banyak UMKM mendapatkan kesempatan berjualan dan memudahkan penyelenggara menemukan UMKM yang pas untuk tipe bazaarnya.

---

## Akun Demo
Organizer : Penyelenggara Bazaar
Vendor : Penyewa Bazaar

| Role | Email | Password |
|---|---|---|
| Organizer | `jack@gmail.com` | `jack@gmail.com` |
| Vendor | `michele@gmail.com` | `123sayang` |

---

## Fitur

### Vendor (Penyewa)

- Registrasi dan login, lengkap dengan profil usaha (kategori, target pasar, deskripsi)
- Kelola produk dan portofolio bazaar yang pernah diikuti
- Jelajahi bazaar dengan filter lokasi dan rentang tanggal
- Rekomendasi bazaar yang diurutkan berdasarkan Match Score
- Ajukan sewa slot, lakukan pembayaran, pantau status pengajuan
- Unduh bukti pembayaran dalam format PDF
- Beri ulasan untuk organizer setelah acara selesai
- Asisten AI untuk mencari bazaar lewat percakapan

### Organizer (Penyelenggara Bazaar)

- Buat dan kelola bazaar beserta area dan jumlah slotnya
- Isi karakteristik area: estimasi pengunjung, profil pengunjung, jam ramai, fasilitas
- Tinjau pengajuan vendor lengkap dengan Match Score dan rinciannya
- Setujui atau tolak pengajuan disertai alasan
- Dashboard okupansi slot dan ringkasan pemasukan
- Beri ulasan untuk vendor setelah acara selesai

---

## Keamanan dan Perlindungan Data

### Data yang Dikumpulkan

| Data | Tujuan |
|---|---|
| Email, password | Autentikasi |
| Nama | Identitas di profil dan pengajuan |
| Nomor telepon / WhatsApp | Komunikasi vendor dengan organizer |
| Data usaha (nama, kategori, deskripsi) | Perhitungan Match Score dan penilaian organizer |
| Media sosial, foto produk, portofolio | Kredibilitas usaha vendor |

Tidak ada data sensitif seperti NIK, nomor rekening, atau data kartu yang disimpan. Pembayaran masih berupa simulasi, sehingga tidak ada transaksi finansial yang diproses.

### Cara Data Dilindungi

| Aspek | Penerapan |
|---|---|
| Password | Ditangani Supabase Auth dengan hashing bcrypt. Aplikasi tidak pernah menyimpan atau membaca password |
| Sesi login | Token dikelola Supabase, diperbarui otomatis |
| Koneksi | HTTPS untuk aplikasi, TLS untuk koneksi database |
| Akses database | Data API Supabase dinonaktifkan; tidak ada endpoint publik ke tabel. Seluruh akses melalui Prisma dari server |
| Otorisasi role | Divalidasi di server, bukan disembunyikan di tampilan. Mengetik URL manual tidak bisa menembus batasan |
| Kepemilikan data | Diperiksa sebelum setiap perubahan. Vendor hanya melihat pengajuannya sendiri, organizer hanya mengelola bazaar miliknya |
| Kredensial | Disimpan sebagai environment variable, tidak ikut ke repositori |

### Batasan

| Hal | Keterangan |
|---|---|
| Verifikasi email | Dinonaktifkan karena kuota pengiriman email pada layanan gratis sangat terbatas. Perlu diaktifkan beserta layanan email khusus untuk produksi |
| Penghapusan akun mandiri | Belum tersedia |
| Ekspor data pribadi | Belum tersedia |
| Autentikasi dua faktor | Belum tersedia |
| Pencatatan audit akses data | Belum tersedia |

---

## Match Score

Skor kecocokan dari sisi Organizer : 
'Seberapa cocok vendor ini dengan bazaar saya.' untuk menyeleksi pengajuan. Dihitung dari 3 faktor:

| Faktor | Bobot | Cara menilai |
|---|---|---|
| Kategori usaha | 50 | Kategori vendor cocok dengan yang dicari area |
| Target pasar | 30 | Target pasar vendor cocok dengan profil pengunjung area |
| Baseline | 20 | Nilai dasar untuk setiap pengajuan |

Skor kecocokan dari sisi Vendor :
'Seberapa cocok bazaar ini untuk produk dan kenyamanan saya.' untuk mengurutkan rekomendasi. Dihitung dari 4 faktor

| Faktor | Bobot | Cara menilai |
|---|---|---|
| Kategori Usaha | 40 | Kategori vendor cocok dengan yang dicari area |
| Target pasar | 25 | Target pasar vendor cocok dengan profil pengunjung area |
| Traffic pengunjung | 20/12/3 | pembobotan skor untuk setiap tier traffic|
| Ketersediaan listrik | 15 | ketersediaan listrik menambah skor kecocokan|

---

## Stack Teknologi

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Autentikasi | Supabase Auth |
| Penyimpanan file | Supabase Storage |
| Styling | Tailwind CSS + shadcn/ui |
| AI Assistant | Google Gemini |
| Generator PDF | jsPDF |
| Hosting | Vercel |

---

## Penggunaan Tools dan AI

Pengembangan BazzUp memanfaatkan beberapa alat bantu berikut, sesuai ketentuan lomba.

### AI Assistant dalam Pengembangan

| Tools | Peran |
|---|---|
| Claude (Anthropic) | Konsultasi arsitektur, pemilihan stack, perancangan skema database, logika Match Score, penulisan dan review kode, penyusunan dokumentasi dan rencana pengujian |
| Claude Code | Agen coding di terminal untuk membantu debugging bug di dalam proyek, serta testing (non primary function) |

Seluruh keputusan desain, alur bisnis, dan verifikasi hasil dilakukan oleh tim. AI digunakan sebagai alat bantu, bukan pengganti pemahaman tim atas kode yang ditulis.

### API Pihak Ketiga

| Layanan | Peran |
|---|---|
| Supabase | Database PostgreSQL, autentikasi, dan penyimpanan file |
| Google Gemini | Mesin asisten AI untuk pencarian bazaar lewat percakapan |
| Vercel | Hosting dan continuous deployment |

### Library Utama

Next.js, React, TypeScript, Prisma, Tailwind CSS, shadcn/ui, Lucide, jsPDF, react-hook-form, zod, Recharts. Daftar lengkap ada di `package.json`.

---

## Panduan Instalasi

### Prasyarat

- Node.js 20 atau lebih baru
- npm
- Akun Supabase (untuk database, auth, dan storage)

### Langkah

**1. Clone repositori**

```bash
git clone https://github.com/natashaDian/bazzup.git
cd bazzup
```

**2. Pasang dependensi**

```bash
npm install
```

**3. Buat file `.env` di root proyek**

Lihat bagian [Konfigurasi](#konfigurasi) untuk daftar variabel yang dibutuhkan.

**4. Siapkan database**

```bash
npx prisma generate
npx prisma db push
```

**5. Isi data awal (opsional)**

```bash
npm run db:seed
```

**6. Jalankan server pengembangan**

```bash
npm run dev
```

Buka http://localhost:3000

---

## Konfigurasi

Buat file `.env` di root proyek dengan isi berikut:

```env
# Koneksi database — ambil dari Supabase: Connect > ORM > Prisma
DATABASE_URL="postgresql://postgres.[ref]:[password]@[host]:6543/postgres?pgbouncer=true&connection_limit=5&pool_timeout=20"
DIRECT_URL="postgresql://postgres.[ref]:[password]@[host]:5432/postgres"

# Supabase Auth & Storage — ambil dari Settings > API
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Google Gemini — untuk fitur AI assistant
GEMINI_API_KEY="..."
```

### Penjelasan variabel

| Variabel | Fungsi |
|---|---|
| `DATABASE_URL` | Koneksi query harian lewat connection pooler (port 6543) |
| `DIRECT_URL` | Koneksi langsung untuk migrasi Prisma (port 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | Alamat proyek Supabase, dipakai untuk auth dan storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci publik Supabase |
| `GEMINI_API_KEY` | Kunci API Google Gemini untuk asisten AI |

### Pengaturan Supabase

Beberapa hal yang perlu diatur di dashboard Supabase:

1. **Region** — pilih Southeast Asia (Singapore) saat membuat proyek
2. **Data API** — dinonaktifkan; seluruh query dilakukan lewat Prisma dari server
3. **Authentication → URL Configuration** — tambahkan URL aplikasi ke Site URL dan Redirect URLs
4. **Storage** — buat bucket publik untuk menyimpan foto bazaar dan produk

---

## Cara Menggunakan

### Sebagai Vendor

1. **Daftar** di `/register`, pilih role Vendor
2. **Lengkapi profil usaha** — kategori dan target pasar wajib diisi karena dipakai untuk menghitung Match Score
3. **Jelajahi bazaar** di halaman utama atau `/explore`. Bagian "Recommended for You" diurutkan berdasarkan kecocokan dengan profil usahamu
4. **Buka detail bazaar** untuk melihat area yang tersedia beserta estimasi pengunjung, profil pembeli, harga per slot, dan fasilitas
5. **Ajukan sewa** dengan menekan "Apply for This Area"
6. **Pantau status** di halaman `/applications`
7. **Bayar** setelah pengajuan disetujui, sebelum batas waktu yang tertera
8. **Unduh bukti pembayaran** dalam format PDF
9. **Beri ulasan** untuk organizer setelah acara selesai

### Sebagai Organizer

1. **Daftar** di `/register`, pilih role Organizer
2. **Buat bazaar** di `/organizer/bazaars` — isi judul, lokasi, tanggal, dan deskripsi
3. **Tambahkan area** ke dalam bazaar. Isi jumlah slot, harga, kategori yang dicari, estimasi pengunjung, profil pengunjung, jam ramai, dan ketersediaan listrik
4. **Tinjau pengajuan** di `/organizer/applications`. Tiap pengajuan menampilkan Match Score beserta rincian faktornya
5. **Setujui atau tolak** pengajuan. Penolakan disertai alasan yang dikirim ke vendor
6. **Pantau okupansi** dan pemasukan di dashboard

---

## Status Pengajuan

Alur status sebuah pengajuan:

```
PENDING → APPROVED → CONFIRMED → COMPLETED
   ↓          ↓           ↓
REJECTED   EXPIRED    CANCELLED
```

| Status | Arti |
|---|---|
| `PENDING` | Menunggu tinjauan organizer |
| `APPROVED` | Disetujui, menunggu pembayaran vendor |
| `REJECTED` | Ditolak organizer |
| `EXPIRED` | Pembayaran lewat batas waktu 24 jam, slot dilepas |
| `CONFIRMED` | Pembayaran diterima, slot terkunci |
| `CANCELLED` | Dibatalkan vendor sebelum acara |
| `COMPLETED` | Acara sudah selesai |

Transisi ke `EXPIRED` dan `COMPLETED` terjadi otomatis saat halaman terkait dimuat.

---

## Struktur Proyek

## Struktur Proyek

```
bazzup/
├── app/
│   ├── (main)/                  Layout untuk halaman publik
│   ├── (organizer)/             Halaman role Organizer
│   │   ├── organizer/           Dashboard, bazaar, applications, profile
│   │   └── layout.tsx           Guard requireOrganizer()
│   ├── (vendor)/                Halaman role Vendor
│   │   ├── about/
│   │   ├── allbazaar/
│   │   ├── applications/        Status pengajuan vendor
│   │   ├── bazaars/             Detail bazaar dan pengajuan slot
│   │   ├── explore/             Pencarian dan filter bazaar
│   │   ├── payment/             Alur pembayaran
│   │   ├── profile/             Profil usaha, produk, portofolio
│   │   ├── vendor/
│   │   └── layout.tsx           Guard requireVendor()
│   ├── api/
│   │   ├── bazaars/
│   │   ├── chat/                Endpoint AI assistant (Gemini)
│   │   └── notifications/
│   ├── login/
│   │   ├── actions.ts
│   │   ├── login-form.tsx
│   │   └── page.tsx
│   ├── register/
│   │   ├── organizer/           Form registrasi organizer
│   │   ├── vendor/              Form registrasi vendor
│   │   ├── actions.ts
│   │   ├── register-form.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx               Root layout
│   └── page.tsx                 Halaman utama
├── components/                  Komponen UI yang dipakai bersama
├── hooks/                       Custom React hooks
├── lib/                         Query Prisma, server action, utilitas
├── prisma/
│   ├── schema.prisma            Definisi struktur database
│   └── seed.ts                  Data awal
└── public/                      Aset statis
```

Folder berkurung seperti `(vendor)` adalah **route group** Next.js — namanya tidak muncul di URL, fungsinya mengelompokkan halaman agar bisa berbagi satu layout. Proteksi role dipasang di `layout.tsx` masing-masing grup, sehingga seluruh halaman di dalamnya otomatis terlindungi.

---

## Catatan Keamanan

- Otorisasi role divalidasi di server melalui layout guard, bukan disembunyikan di tampilan
- Kepemilikan data diperiksa sebelum setiap operasi ubah — organizer tidak bisa menyentuh pengajuan di bazaar milik orang lain
- Validasi ketersediaan slot dan pengecekan pengajuan ganda dilakukan ulang di server, sehingga tidak bisa dilewati dari sisi klien
- Data API Supabase dinonaktifkan; seluruh akses database melalui Prisma dari server
- Password dikelola Supabase Auth dengan hashing bcrypt

---

## Perintah yang Tersedia

```bash
npm run dev        # jalankan server pengembangan
npm run build      # build untuk produksi
npm run start      # jalankan hasil build
npm run lint       # periksa gaya penulisan kode
npm run db:seed    # isi database dengan data awal
```

---

## Tim

| Nama | GitHub |
|---|---|
| Natasha Dian Mahardita | [@natashaDian](https://github.com/natashaDian) |
| Rainer Yesaya Villareal | [@RainerYesaya](https://github.com/RainerYesaya) |
| Shafa Naura Livka Naycilla| [@naycilla](https://github.com/naycilla) |


---

## Lisensi

Proyek ini dilisensikan di bawah MIT License. Lihat berkas [LICENSE](LICENSE) untuk keterangan lengkap.
