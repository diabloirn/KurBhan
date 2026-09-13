import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-dock-stripe hazard-stripes-slim" />
      
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand & Warehouse Identity */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-crate-icon">
                <Package className="h-4.5 w-4.5" strokeWidth={2.5} />
              </div>
              <span className="footer-logo-title">
                KurBhan
              </span>
            </Link>
            <p className="footer-brand-desc">
              Infrastruktur logistik kargo darat, laut, dan udara. Menghubungkan sentra industri dan UMKM ke seluruh pulau Indonesia dengan kepastian tarif.
            </p>
            <div className="footer-dock-badge">
              DOCK OPERASIONAL: 07:00 — 22:00 WIB
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="footer-col-title">
              Layanan Kargo
            </h3>
            <ul className="footer-links">
              <li>
                <Link to="/booking" className="footer-link">
                  Kirim Kargo & Paket
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="footer-link">
                  Lacak Resi Fisik
                </Link>
              </li>
              <li>
                <Link to="/booking" className="footer-link">
                  Kalkulator Bobot Volumetrik
                </Link>
              </li>
              <li>
                <Link to="/admin" className="footer-link">
                  Monitoring Manifes Pengiriman
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal Akun */}
          <div>
            <h3 className="footer-col-title">
              Manifes & Akun
            </h3>
            <ul className="footer-links">
              <li>
                <Link to="/login" className="footer-link">
                  Masuk Akun Pengirim
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-link">
                  Daftar Akun Bisnis
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="footer-link">
                  Dashboard Riwayat Manifes
                </Link>
              </li>
              <li>
                <Link to="/admin" className="footer-link">
                  Control Center Operasional
                </Link>
              </li>
            </ul>
          </div>

          {/* Koridor Logistik */}
          <div>
            <h3 className="footer-col-title">
              Hub Utama
            </h3>
            <ul className="footer-links">
              <li><span className="footer-link">Jakarta (Tanjung Priok Hub)</span></li>
              <li><span className="footer-link">Surabaya (Tanjung Perak Hub)</span></li>
              <li><span className="footer-link">Bandung (Gedebage Cargo)</span></li>
              <li><span className="footer-link">Medan (Belawan Gateway)</span></li>
              <li><span className="footer-link">Makassar (Soekarno-Hatta)</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} KurBhan Logistik Nusantara. Hak cipta dilindungi.
          </p>
          <div className="footer-legal-links">
            <span className="footer-legal-link">
              Kebijakan Penanganan Kargo
            </span>
            <span className="footer-legal-link">
              Syarat & Ketentuan Pengangkutan
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
