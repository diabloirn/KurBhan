# KurBhan — Platform Logistik & Pengiriman Multiplatform

Platform logistik dan pengiriman barang skala besar (multiplatform) yang menghubungkan pengirim (individu maupun pelaku bisnis/UMKM) dengan layanan armada darat, laut, dan udara di seluruh Indonesia.

Dibangun di atas arsitektur **Microservices berbasis Go**, frontend **React + TypeScript + Three.js**, komunikasi **gRPC & gRPC-Web** via **Envoy Proxy**, basis data **PostgreSQL (Supabase)**, serta antarmuka visual bertema **Gudang Logistik & Peti Kemas (Warehouse, Freight & Waybill Manifest)**.

---

## 📊 Status Proyek & Ringkasan Progress

**Overall Progress: 🟢 ~85% (Frontend & Backend Core Siap Digunakan)**

| Komponen Sistem | Status | Keterangan |
| :--- | :---: | :--- |
| **Arsitektur Microservices Go** | ✅ **Selesai (100%)** | Auth, Rate, & Shipment Service terimplementasi penuh |
| **Database & Migrasi SQL** | ✅ **Selesai (100%)** | Skema Auth, Rate, Shipment, dan Seed Wilayah Indonesia |
| **API Gateway & gRPC-Web (Envoy)** | ✅ **Selesai (100%)** | Envoy Proxy 8080 terhubung ke layanan gRPC port 50051–50053 |
| **Frontend UI & Visual Identity** | ✅ **Selesai (100%)** | Redesain fisik pergudangan, Three.js 3D Palet & Peti Kemas |
| **Modularitas File & CSS** | ✅ **Selesai (100%)** | Seluruh file `.tsx` memiliki companion `.css` terpisah |
| **Multi-Cross Platform** | ✅ **Selesai (100%)** | Responsif Mobile (100dvh, safe-area, 44px touch), Tablet, Desktop |
| **Kualitas Kode (Linter & TS)** | ✅ **Selesai (100%)** | 0 Linter Warning (`oxlint`), 0 Type Error (`tsc -b`), Build Lulus |
| **Integrasi Payment Gateway Fisik** | ⏳ **Belum (Pending)** | Saat ini menggunakan Mock QRIS/Transfer + Admin Verification |
| **Otomasi Percakapan n8n & WhatsApp**| ⏳ **Belum (Pending)** | Webhook notifikasi status resi belum terhubung ke gateway WA |
| **Scraping Daemon Kompetitor** | ⏳ **Belum (Pending)** | UI benchmark sudah siap, worker scraping periodik belum running |
| **Aplikasi Driver Khusus (PWA Scanner)**| ⏳ **Belum (Pending)** | Penugasan armada ada di Admin Control Room, aplikasi kurir khusus belum dibuat |

---

## 🚀 Bagian yang SUDAH Selesai (Implemented)

### 1. Backend Microservices & Basis Data
- **Auth Service (gRPC :50051)**:
  - Registrasi pengguna & autentikasi JWT.
  - Role customer & admin.
  - Proteksi Multi-Factor Authentication (MFA).
- **Rate Service (gRPC :50052)**:
  - Kalkulasi tarif berbasis berat aktual vs. dimensi volumetrik (\(P \times L \times T / 4000\)).
  - Tarif multi-armada: Motor, Mobil Box Kecil, Mobil Box Sedang, Mobil Box Besar, Truk Fuso, Truk Tronton, Kontainer 20ft/40ft.
  - Layanan Kargo Cepat (Prioritas), Reguler (Ekonomis), dan Kargo Laut/Kontainer.
- **Shipment Service (gRPC :50053)**:
  - `CreateShipment`: Generate nomor resi resmi format `KB-YYYYMMDD-XXXXXX`.
  - `TrackShipment`: Riwayat pergerakan paket real-time beserta riwayat status.
  - `UpdateShipmentStatus`: Pembaruan titik manifest kargo oleh operator gudang.
  - `CancelShipment`: Pembatalan pengiriman sebelum paket dijemput.
- **Basis Data PostgreSQL & Migrasi**:
  - Migrasi `000001_create_auth_schema.up.sql`.
  - Migrasi `000002_create_rate_schema.up.sql`.
  - Migrasi `000003_create_shipment_schema.up.sql`.
  - Script import data 80.000+ desa/kelurahan, kecamatan, kota, provinsi se-Indonesia (`scripts/WilayahIndonesia/`).
- **Envoy Proxy Gateway (:8080)**:
  - Transcoding HTTP/JSON & gRPC-Web client ke upstream service gRPC internal.

---

### 2. Frontend React 19 + TypeScript + Three.js
- **Identitas Visual "Gudang & Peti Kemas" (Anti AI-Slop)**:
  - Palet warna industri: Kayu Peti Gelap (`#3A2E22`), Kardus Bergelombang Kraft (`#C9A876`), Kertas Resi Usang (`#EFE7D8`), Kuning Hazard Peringatan (`#F2B705`), Hitam Aspal Forklift (`#1C1C1C`), dan Abu Beton (`#7A8B87`).
  - Tipografi fisik stensil kargo: **Barlow Condensed** (label tebal, tegas) dan **IBM Plex Sans** (surat jalan presisi).
  - Elemen dekoratif: Marka lantai dermaga gudang (`.hazard-stripes`), solid offset box-shadow (`3px 3px 0px #1C1C1C`), dan stensil manifest kargo.
- **Interaktif 3D Three.js Freight Scene (`PackageScene.tsx`)**:
  - Palet kayu standar logistik dengan balok penopang asli (*runner blocks*).
  - Peti kargo kayu berat dengan sudut penguat besi (*metal corner angle brackets*).
  - Tumpukan kardus kraft bergelombang bertali pengikat (*hazard strapping bands*).
  - Efek fisika *drop & settling* saat dimuat serta paralaks halus mengikuti posisi kursor.
- **Pemisahan File CSS Bersih (Modular Architecture)**:
  - Setiap halaman memiliki pasangan file `.tsx` dan `.css` terpisah tanpa inline style campur aduk:
    - `Home.tsx` + `Home.css`
    - `Booking.tsx` + `Booking.css`
    - `Tracking.tsx` + `Tracking.css`
    - `Dashboard.tsx` + `Dashboard.css`
    - `Admin.tsx` + `Admin.css`
    - `Login.tsx` + `Login.css`
    - `Register.tsx` + `Register.css`
    - `Header.tsx` + `Header.css`
    - `Footer.tsx` + `Footer.css`
    - `PackageScene.tsx` + `PackageScene.css`
- **Multi-Cross Platform & Responsif**:
  - Dukungan layar *notch/gesture bar* dengan `100dvh` dan `safe-area-inset-bottom`.
  - Target sentuh ergonomis minimum `44px` untuk tombol dan input pada layar sentuh (`pointer: coarse`).
  - Drawer menu mobile khusus dengan navigasi sekali sentuh.
  - Skalabilitas kanvas 3D yang dinamis pada layar ponsel (`300px`), tablet (`380px`), dan desktop (`520px`).
- **Resilience Data Layer**:
  - Integrasi gRPC-Web native dengan fallback otomatis ke local storage manifes (`shipmentStorage.ts`) saat backend tidak terhubung, sehingga seluruh alur demo UI tetap berjalan lancar.

---

## ⏳ Bagian yang BELUM Selesai (Pending / Next Roadmap)

Berikut adalah daftar backlog fitur yang perlu diselesaikan pada fase pengembangan berikutnya:

### 1. Payment Gateway Real (Midtrans / Xendit / Tripay)
- [ ] Integrasi webhook callback notifikasi pembayaran lunas dari payment gateway.
- [ ] Penggantian mock QRIS/transfer dengan dynamic QRIS interaktif (Snap API).
- [ ] Otomatisasi perubahan status pembayaran ke `VERIFIED` setelah callback gateway diterima.

### 2. Otomasi n8n & WhatsApp Notification Webhook
- [ ] Pembuatan alur n8n (*workflow*) untuk menghubungkan event gRPC `UpdateShipmentStatus` ke nomor WhatsApp pengirim & penerima.
- [ ] Template pesan otomatis: Notifikasi penjemputan armada, notifikasi resi dalam perjalanan, dan notifikasi serah terima paket.
- [ ] Penanganan pesan dua arah / chatbot FAQ tarif melalui n8n webhook.

### 3. Worker Background Scraping Engine (FR-5)
- [ ] Implementasi Golang scraping engine terjadwal (cron worker) untuk mengambil acuan harga riil dari kompetitor (JNE, J&T, SiCepat).
- [ ] Penyimpanan histori audit trail fluktuasi margin tarif ke database tabel `rate_benchmarks`.
- [ ] Penghubungan tombol *"Jalankan Scraping Sekarang"* di Admin Control Room ke RPC backend aktif.

### 4. Dedicated Driver / Field Courier Interface
- [ ] Halaman khusus kurir/driver dengan mode PWA (*Progressive Web App*).
- [ ] Fitur scan barcode / QR resi langsung menggunakan kamera smartphone di lapangan.
- [ ] Upload foto bukti serah terima paket (*Proof of Delivery*) saat status diubah menjadi `DELIVERED`.

### 5. Otomasi Pengujian & CI/CD Pipeline
- [ ] Setup GitHub Actions workflow untuk automated build, lint check (`oxlint`), dan type check (`tsc`).
- [ ] End-to-end integration tests backend via gRPC runner di dalam container Docker.

---

## 🛠️ Panduan Menjalankan Sistem (How to Run)

### Prasyarat
- **Node.js**: v18+ (Disarankan v20+)
- **Go**: v1.21+
- **Docker & Docker Compose**: v2+
- **Python**: v3.10+ (opsional untuk re-seed wilayah)

---

### 1. Menjalankan Frontend
```bash
# Masuk ke direktori frontend
cd frontend

# Install dependensi
npm install

# Jalankan server pengembangan
npm run dev
# Buka http://localhost:5173 di browser

# Linter & Type Check
npm run lint
npx tsc -b --noEmit

# Production Build
npm run build
```

---

### 2. Menjalankan Backend & Envoy via Docker
```bash
# Dari root direktori KurBhan
docker-compose up --build -d

# Cek container yang sedang berjalan
docker ps

# Port Service:
# - Envoy Proxy: http://localhost:8080
# - Auth Service: localhost:50051
# - Rate Service: localhost:50052
# - Shipment Service: localhost:50053
# - PostgreSQL: localhost:5432
```

---

### 3. Import / Seed Data Wilayah Indonesia (Opsional)
```bash
cd scripts/WilayahIndonesia
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
python import_wilayah.py
```

---

## 📁 Struktur Direktori Proyek

```text
KurBhan/
├── backend/                  # Layanan microservices Golang
│   ├── cmd/server/           # Entrypoint server Go
│   ├── internal/
│   │   ├── config/           # Konfigurasi database & environment
│   │   ├── db/               # Inisialisasi pool PostgreSQL
│   │   └── services/         # Handlers: auth, rate, shipment
│   └── migrations/           # Skema migrasi SQL
├── envoy/                    # Konfigurasi Envoy Gateway (gRPC-Web & HTTP)
│   └── envoy.yaml
├── proto/                    # Kontrak antarmuka Protocol Buffers
│   └── kurbhan.proto
├── scripts/                  # Script helper & database seeder
│   └── WilayahIndonesia/     # Data wilayah administratif Indonesia
└── frontend/                 # Aplikasi Web React + TypeScript + Three.js
    ├── index.html            # Entry point HTML & font imports
    ├── src/
    │   ├── components/       # Komponen global (Header, Footer, Layout, PackageScene)
    │   ├── data/             # Dataset statis (wilayah, armada, rute)
    │   ├── hooks/            # Custom React hooks (useAuth, dll.)
    │   ├── lib/              # Helper utilities & local manifest storage
    │   ├── pages/            # Halaman utama (Home, Booking, Tracking, Dashboard, Admin, Auth)
    │   ├── proto/            # Generated gRPC-Web stubs & models
    │   └── services/         # Client gRPC-Web (grpcClient.ts)
    ├── package.json
    └── vite.config.ts
```

---

## 📄 Lisensi & Hak Cipta

© 2026 **KurBhan Project** — Dikembangkan oleh **Muhamad Nabhan Fadhlurrohman**. Hak Cipta Dilindungi.
