# Aplikasi Pencatatan Meter Air PDAM

Aplikasi ini digunakan untuk mencatat dan mengelola data meter air pelanggan PDAM. Sistem ini memungkinkan petugas untuk mencatat pembacaan meter, mengelola data pelanggan, dan menghasilkan berbagai laporan analitik.

## Fitur

- **Manajemen Pengguna**
  - Autentikasi dan otorisasi berbasis peran (Admin, Supervisor, Petugas)
  - Manajemen profil pengguna
  - Keamanan dengan JWT

- **Manajemen Pelanggan**
  - Pencarian dan filter pelanggan
  - Pengelolaan data pelanggan
  - Riwayat pembacaan meter pelanggan
  - Pencarian berdasarkan lokasi geografis

- **Pencatatan Meter**
  - Pencatatan pembacaan meter dengan foto
  - Verifikasi pembacaan meter
  - Penanganan pembacaan yang bermasalah
  - Pelacakan lokasi pembacaan dengan GPS

- **Laporan dan Analitik**
  - Dashboard dengan statistik utama
  - Laporan konsumsi bulanan dan tahunan
  - Laporan kinerja petugas
  - Deteksi anomali konsumsi
  - Visualisasi data dengan grafik

## Teknologi

### Frontend
- React.js
- Material-UI untuk antarmuka pengguna
- React Router untuk navigasi
- Context API untuk manajemen state
- Axios untuk HTTP requests

### Backend
- Node.js dengan Express
- MongoDB untuk database
- JWT untuk autentikasi
- Mongoose untuk ODM
- Multer untuk upload file

## Cara Menjalankan

### Prasyarat

- Node.js (versi 14 atau lebih tinggi)
- npm atau yarn
- MongoDB

### Langkah-langkah

1. Clone repositori ini
2. Instal dependensi:
   ```bash
   # Instal dependensi backend
   cd backend
   npm install

   # Instal dependensi frontend
   cd ../frontend
   npm install
   ```
3. Konfigurasi lingkungan:
   - Buat file `.env` di folder backend berdasarkan `.env.example`
   - Sesuaikan konfigurasi database dan JWT secret

4. Jalankan aplikasi:
   ```bash
   # Jalankan backend (dari folder backend)
   npm run dev

   # Jalankan frontend (dari folder frontend)
   npm start
   ```

5. Akses aplikasi di `http://localhost:3000`

## Struktur Proyek

```
pdam/
├── frontend/                # Aplikasi React
│   ├── public/              # Aset publik
│   └── src/                 # Kode sumber
│       ├── assets/          # Gambar, ikon, dll
│       ├── components/      # Komponen React yang dapat digunakan kembali
│       ├── context/         # Context API untuk manajemen state
│       ├── pages/           # Halaman aplikasi
│       ├── App.js           # Komponen utama aplikasi
│       └── index.js         # Entry point
│
├── backend/                 # Server Node.js
│   ├── src/                 # Kode sumber
│   │   ├── config/          # Konfigurasi aplikasi
│   │   ├── controllers/     # Controller untuk logika bisnis
│   │   ├── middleware/      # Middleware Express
│   │   ├── models/          # Model data Mongoose
│   │   ├── routes/          # Definisi rute API
│   │   └── index.js         # Entry point server
│   └── package.json         # Dependensi backend
│
├── docs/                    # Dokumentasi
└── README.md                # Dokumentasi utama
```

## Peran Pengguna

- **Admin**: Akses penuh ke semua fitur, termasuk manajemen pengguna, verifikasi pembacaan, dan semua laporan.
- **Supervisor**: Dapat memverifikasi pembacaan meter, melihat laporan kinerja, dan mendeteksi anomali.
- **Petugas**: Dapat mencatat pembacaan meter dan melihat data pelanggan.

## Lisensi

MIT