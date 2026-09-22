# KurBhan — Platform Logistik & Pengiriman Multiplatform

Platform logistik dan pengiriman barang skala besar (multiplatform) yang menghubungkan pengirim (individu maupun pelaku bisnis/UMKM) dengan layanan armada darat, laut, dan udara di seluruh Indonesia.

Dibangun di atas arsitektur **Microservices berbasis Go**, frontend **React + TypeScript + Three.js**, komunikasi **gRPC & gRPC-Web** via **Envoy Proxy**, basis data **PostgreSQL (Supabase)**, serta antarmuka visual bertema **Gudang Logistik & Peti Kemas (Warehouse, Freight & Waybill Manifest)**.

---

## 📊 Status Proyek & Ringkasan Progress

**Overall Progress: 🟢 ~98% (Core Backend & Frontend Lengkap & Terverifikasi)**

| Komponen Sistem | Status | Keterangan |
| :--- | :---: | :--- |
| **Arsitektur Microservices Go** | ✅ **Selesai (100%)** | Auth (:50051), Rate (:50052), Shipment (:50053), Payment (:50054) |
| **Sistem Pembayaran Multi-Channel** | ✅ **Selesai (100%)** | VA (Prefix + No Telp), Transfer Bank Crosscheck, COD (Min DP 50%) |
| **Otomasi Baca Transaksi VA (1x24 Jam)** | ✅ **Selesai (100%)** | Backend & DB membaca mutasi masuk, auto-accept & auto-reject jika kedaluwarsa |
| **Scraping Daemon Kompetitor** | ✅ **Selesai (100%)** | Go daemon periodik (6 jam) benchmark tarif JNE, J&T, SiCepat |
| **Driver API (Penghubung Kurir)** | ✅ **Selesai (100%)** | RPC kurir (terima job, update lokasi, COD collection) + Dokumen `DRIVER_API.md` |
| **Keamanan & Secrets (No Hardcoding)** | ✅ **Selesai (100%)** | Seluruh kredensial menggunakan `.env` & `.env.example`, JWT dynamic |
| **TDD Security Test Suites** | ✅ **Selesai (100%)** | Tes keamanan amount tampering, replay attacks, expiry bypass, SQLi |
| **Halaman Pusat Bantuan (FAQ)** | ✅ **Selesai (100%)** | FAQ 6 kategori menggantikan otomasi n8n sesuai arahan |
| **API Gateway & gRPC-Web (Envoy)** | ✅ **Selesai (100%)** | Envoy Proxy 8080 routing ke semua 4 microservice |
| **Frontend UI & Visual Identity** | ✅ **Selesai (100%)** | Redesain fisik pergudangan, Three.js 3D Palet & Peti Kemas |
| **Kualitas Kode (Linter & TS)** | ✅ **Selesai (100%)** | 0 Linter Warning (`oxlint`), 0 Type Error (`tsc -b`), Build Lulus |

---

## 🚀 Fitur & Implementasi Backend yang Selesai

### 1. Payment Service (gRPC :50054) & Pembayaran Multi-Channel
- **Virtual Account (VA) Terintegrasi Nomor Telepon**:
  - Nomor VA otomatis digabungkan dengan nomor telepon pelanggan (Format: `Prefix Bank + Clean Phone Number`).
  - Prefix resmi:
    - **BCA**: `39107` + No. HP
    - **BLU by BCA**: `00789` + No. HP
    - **Mandiri**: `89508` + No. HP
    - **BNI**: `8241` + No. HP
    - **BRI (BRIVA)**: `88099` + No. HP
  - **Otomatisasi Baca Transaksi VA (`ProcessVATransaction`)**:
    - Backend & database membaca transaksi masuk secara otomatis.
    - Cek batas waktu pembayaran maksimal **1 x 24 jam** (`expired_at`). Jika melebihi -> `EXPIRED` (Ditolak).
    - Cek kesesuaian nominal (Exact Amount Matching). Jika kurang/lebih -> `REJECTED` (Ditolak).
    - Jika cocok -> `ACCEPTED` (LUNAS), status pengiriman otomatis diperbarui menjadi `PICKED_UP`.
- **Transfer Bank Manual & Crosscheck Engine (`ConfirmPayment`)**:
  - Wajib menyertakan: **Nama Lengkap Pengirim**, **Nomor Telepon**, **Nominal Transfer**, dan **Bukti Transfer (Struk)**.
  - Backend melakukan crosscheck otomatis:
    - Memverifikasi nama dan nomor telepon pengirim.
    - Memverifikasi nominal transfer dengan tagihan sistem.
    - Memverifikasi keberadaan bukti transfer fisik.
    - Cek batas waktu 1x24 jam sebelum kedaluwarsa.
  - Pilihan bank tujuan: BCA (8890123456), BLU by BCA (0078901234), Mandiri (1270012345678), BNI (0987654321), BRI (034501000123456).
- **Cash on Delivery (COD) dengan DP Minimal 50%**:
  - Pengirim wajib membayar Down Payment (DP) minimal 50% dari total biaya saat armada menjemput barang.
  - Sisa tagihan (maksimal 50%) dilunasi oleh penerima saat paket tiba di alamat tujuan.
  - Validasi ketat di backend menolak pemesanan jika DP < 50%.

### 2. Driver API (Aplikasi Kurir) & Ekstensi ShipmentService
API penghubung aplikasi driver telah diimplementasikan pada `ShipmentService` dan didokumentasikan secara rinci di [`docs/DRIVER_API.md`](file:///e:/KurBhan/docs/DRIVER_API.md):
- `GetDriverAssignedShipments`: Menampilkan daftar penugasan pengiriman untuk driver.
- `AcceptShipmentJob`: Driver menerima penugasan pengiriman.
- `UpdateDriverLocation`: Pelacakan koordinat GPS real-time (latitude, longitude) driver.
- `CompleteDelivery`: Penyelesaian pengiriman dengan foto bukti serah terima (POD).
- `CollectCODPayment`: Pencatatan uang tunai COD yang diterima driver (DP saat jemput atau sisa saat tiba).

### 3. Scraping Daemon Kompetitor (`scraping_daemon/`)
- Daemon latar belakang berbasis Go (`scraping-daemon`) yang berjalan setiap 6 jam untuk mengambil data tarif ekspedisi nasional:
  - JNE Reguler
  - J&T Express EZ
  - SiCepat BEST
- Menyimpan riwayat tarif ke tabel database `competitor_rates` untuk benchmark real-time di halaman Booking dan Admin.

### 4. Pusat Bantuan & FAQ Logistik (`/faq`)
- Sesuai arahan, modul otomasi n8n digantikan dengan halaman **Pusat Bantuan & FAQ Interaktif** (`FAQ.tsx` + `FAQ.css`).
- Memuat 6 kategori utama (~20 pertanyaan):
  1. Pengiriman Umum & Estimasi
  2. Sistem Pembayaran (VA, Transfer, COD DP 50%)
  3. Armada & Kurir
  4. Keamanan, Garansi & Klaim
  5. Akun & Kemitraan Bisnis/UMKM
  6. Perhitungan Berat Volumetrik & Tarif Transparan

### 5. Keamanan & Kualitas (Security Hardening & TDD)
- **Zero Hardcoded Secrets**:
  - Tidak ada lagi password database atau secret token di dalam kode maupun `docker-compose.yml`.
  - Menggunakan template [`.env.example`](file:///e:/KurBhan/.env.example) dan file aman `.env` yang masuk `.gitignore`.
  - Frontend menggunakan `import.meta.env.VITE_API_URL` dengan fallback cerdas.
- **Test Driven Development (TDD)**:
  - Suite pengujian keamanan komprehensif di `payment_service/handler/handler_test.go`:
    - `TestCleanAndValidatePhoneNumber`: Uji validasi format nomor HP Indonesia (+62, 08xx) dan pencegahan SQL Injection.
    - `TestGenerateVANumberWithPhone`: Uji pembentukan nomor VA resmi bank.
    - `TestSecurity_COD_Minimum50PercentDP`: Uji pencegahan underpayment COD < 50%.
    - `TestSecurity_VATransaction_AmountTampering`: Uji deteksi kecurangan nominal uang masuk.
    - `TestSecurity_VATransaction_Expiry24Hours`: Uji penolakan otomatis transaksi melewati 1x24 jam.
    - `TestSecurity_VATransaction_ReplayAttack_Idempotent`: Uji pencegahan double-spending / replay callback.
    - `TestSecurity_BankTransfer_CrossCheck`: Uji kelengkapan nama, nomor telepon, dan bukti transfer.
  - Seluruh pengujian backend berstatus **100% PASS**.

---

## 🛠️ Panduan Menjalankan Sistem

### 1. Konfigurasi Environment Variables
Salin template lingkungan dan isi kredensial Anda:
```bash
cp .env.example .env
```

### 2. Menjalankan Seluruh Ekosistem dengan Docker Compose
```bash
docker-compose up --build -d
```
Layanan yang akan berjalan:
- `auth-service` di port `50051`
- `rate-service` di port `50052`
- `shipment-service` di port `50053`
- `payment-service` di port `50054`
- `scraping-daemon` (background worker periodik)
- `memcached` di port `11211`
- `envoy` proxy di port `8080`

### 3. Menjalankan Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### 4. Menjalankan Unit Tests (Backend)
```bash
# Test Payment Service
cd backend/internal/services/payment_service
go test -v ./...

# Test Shipment Service
cd ../shipment_service
go test -v ./...

# Test Scraping Daemon
cd ../scraping_daemon
go test -v ./...
```

---

## 📖 Dokumentasi API Driver
Untuk pengembang aplikasi mobile kurir (driver), silakan membaca spesifikasi lengkap di:
👉 [`docs/DRIVER_API.md`](file:///e:/KurBhan/docs/DRIVER_API.md)
