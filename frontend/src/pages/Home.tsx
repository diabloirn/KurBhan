import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Truck, 
  Anchor, 
  Plane, 
  FileText, 
  Boxes, 
  CheckSquare 
} from 'lucide-react';
import './Home.css';

const PackageScene = lazy(() => import('../components/PackageScene'));

export default function Home() {
  return (
    <div className="home-root">
      {/* 1. Industrial Hero Dock */}
      <section className="home-hero-dock">
        <div className="home-hero-grid">
          <div className="home-hero-manifest">
            <div className="home-manifest-badge">
              <span>MANIFEST EKSPEDISI NUSANTARA</span>
              <span>•</span>
              <span>DARAT • LAUT • UDARA</span>
            </div>

            <h1 className="home-headline">
              Kirim kargo dan paket besar tanpa tebak-tebakan tarif.
            </h1>

            <p className="home-lead-text">
              Platform logistik skala riil untuk pengiriman barang individu dan bisnis. Kalkulasi tarif transparan di muka, alokasi armada box hingga tronton, dan pemantauan manifes fisik secara real-time ke seluruh pelosok Indonesia.
            </p>

            <div className="home-action-cluster">
              <Link to="/booking" className="hazard-btn">
                Buat Pengiriman Kargo
              </Link>
              <Link to="/tracking" className="paper-btn">
                Lacak Resi Fisik
              </Link>
            </div>
          </div>

          <div className="home-hero-3d-wrap">
            <Suspense fallback={<div className="home-3d-fallback">Memuat Palet & Peti Kargo 3D...</div>}>
              <PackageScene />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Hazard Line Marka Lantai Gudang */}
      <div className="warehouse-dock-line hazard-stripes" />

      {/* 2. Asymmetric Warehouse Capability Bento Section */}
      <section className="warehouse-spec-section">
        <div className="warehouse-spec-container">
          <div className="warehouse-section-head">
            <span className="stencil-tag stencil-wood w-fit">STANDAR GUDANG & PENGIRIMAN</span>
            <h2 className="warehouse-section-title">Kepastian bobot, armada, dan rute.</h2>
          </div>

          <div className="warehouse-bento-grid">
            {/* Panel 1: Kraft Waybill Style (Volumetric vs Actual Weight Transparency) */}
            <div className="spec-kraft-box">
              <div>
                <div className="spec-box-header">
                  <div>
                    <span className="stencil-tag stencil-hazard mb-2">TARIF TRANSPARAN</span>
                    <h3 className="spec-title">Kalkulasi Otomatis Bobot Volumetrik</h3>
                  </div>
                  <Scale className="w-8 h-8 text-[var(--kb-wood)] shrink-0" />
                </div>
                <p className="spec-copy">
                  Tidak ada biaya siluman atau timbangan fiktif di konter. Rumus tarif KurBhan menghitung perbandingan bobot aktual (kg) terhadap dimensi kubikasi kargo secara otomatis sebelum Anda membayar.
                </p>
              </div>

              <div className="spec-volumetric-comparison">
                <div className="spec-metric-col">
                  <span className="spec-metric-label">Standar Kubikasi Darat</span>
                  <span className="spec-metric-val">(P x L x T) / 4.000</span>
                  <span className="text-xs text-[var(--kb-wood-light)] mt-1">Sesuai standar asosiasi logistik darat nasional</span>
                </div>
                <div className="spec-metric-col">
                  <span className="spec-metric-label">Benchmark Ekspedisi</span>
                  <span className="spec-metric-val text-[var(--kb-green)]">Hemat s/d 24%</span>
                  <span className="text-xs text-[var(--kb-wood-light)] mt-1">Dibandingkan langsung dengan tarif JNE, J&T, SiCepat</span>
                </div>
              </div>
            </div>

            {/* Panel 2: Heavy Steel Fleet & Multi-modal Capacity */}
            <div className="spec-steel-rack">
              <div className="spec-subpanel">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-[var(--kb-wood)]" />
                  <span className="stencil-tag stencil-wood">ARMADA DARAT BERBAGAI KELAS</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--kb-wood)] mb-2">Mobil Box Hingga Truk Tronton Hino</h3>
                <p className="text-sm text-[var(--kb-asphalt)]">
                  Dari paket reguler 1 kg, muatan box engkel 3 ton, hingga peti kemas tronton 20 ton langsung dari dermaga atau gudang Anda.
                </p>
              </div>

              <div className="spec-subpanel-dark">
                <div className="flex items-center gap-2 mb-3">
                  <Anchor className="w-5 h-5 text-[var(--kb-hazard)]" />
                  <Plane className="w-5 h-5 text-[var(--kb-hazard)]" />
                  <span className="stencil-tag stencil-hazard">INTER-ISLAND CORRIDOR</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Jalur Lintas Pulau Laut Ro-Ro & Kargo Udara</h3>
                <p className="text-sm">
                  Koneksi terintegrasi antar-pelabuhan utama nusantara (Tanjung Priok, Tanjung Perak, Belawan, Makassar) dengan jadwal keberangkatan pasti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sequential Conveyor Journey (Cara Kerja Fisik Logistik) */}
      <section className="conveyor-section">
        <div className="conveyor-container">
          <div className="warehouse-section-head">
            <span className="stencil-tag stencil-wood w-fit">MANIFES OPERASIONAL</span>
            <h2 className="warehouse-section-title">Perjalanan fisik setiap peti muatan.</h2>
          </div>

          <div className="conveyor-track-grid">
            {/* Step 1 */}
            <div className="conveyor-bay-card">
              <div className="conveyor-bay-header">
                <span className="conveyor-bay-num">01</span>
                <FileText className="w-6 h-6 text-[var(--kb-wood)]" />
              </div>
              <h3 className="conveyor-bay-title">Cetak Surat Jalan & Stensil Label</h3>
              <p className="conveyor-bay-desc">
                Input spesifikasi barang di kalkulator. Sistem menerbitkan nomor resi sah dan instruksi penanganan khusus (stempel Fragile / This Side Up).
              </p>
            </div>

            {/* Step 2 */}
            <div className="conveyor-bay-card">
              <div className="conveyor-bay-header">
                <span className="conveyor-bay-num">02</span>
                <Boxes className="w-6 h-6 text-[var(--kb-wood)]" />
              </div>
              <h3 className="conveyor-bay-title">Muat Palet & Angkut Armada</h3>
              <p className="conveyor-bay-desc">
                Kurir dan armada yang dialokasikan menjemput barang di lokasi Anda. Peti dimuat ke palet kargo dan diverifikasi pada manifes keberangkatan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="conveyor-bay-card">
              <div className="conveyor-bay-header">
                <span className="conveyor-bay-num">03</span>
                <CheckSquare className="w-6 h-6 text-[var(--kb-green)]" />
              </div>
              <h3 className="conveyor-bay-title">Serah Terima & Segel Utuh</h3>
              <p className="conveyor-bay-desc">
                Paket tiba di gudang tujuan atau depan pintu penerima. Status manifes diperbarui seketika dengan tanda tangan digital dan foto bukti serah terima.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Industrial Dispatch CTA Dock */}
      <section className="dispatch-dock-section">
        <div className="dispatch-dock-container">
          <span className="stencil-tag stencil-hazard mb-3">DOCK PENERIMAAN TERBUKA</span>
          <h2 className="dispatch-dock-title">
            Siap mengirim kargo pertamamu hari ini?
          </h2>
          <p className="dispatch-dock-copy">
            Bergabung dengan ribuan online seller dan pelaku usaha yang mengandalkan transparansi tarif serta keandalan armada KurBhan di seluruh Indonesia.
          </p>
          <div className="dispatch-dock-actions">
            <Link to="/booking" className="hazard-btn text-lg py-3 px-8">
              Buka Form Pengiriman Kargo
            </Link>
            <Link to="/tracking" className="paper-btn text-lg py-3 px-8">
              Cek Status Resi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
