import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Package className="h-4 w-4" />
              </div>
              <span>Kur<span className="text-indigo-600">Bhan</span></span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Platform logistik modern untuk pengiriman paket ke seluruh Indonesia dengan tarif transparan dan tracking real-time.
            </p>
          </div>

          {/* Links: Layanan */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Layanan</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/booking" className="text-sm text-slate-500 hover:text-indigo-600">Kirim Paket</Link></li>
              <li><Link to="/tracking" className="text-sm text-slate-500 hover:text-indigo-600">Lacak Kiriman</Link></li>
              <li><Link to="/booking" className="text-sm text-slate-500 hover:text-indigo-600">Cek Tarif</Link></li>
            </ul>
          </div>

          {/* Links: Perusahaan */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Perusahaan</h3>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-slate-500">Tentang Kami</span></li>
              <li><span className="text-sm text-slate-500">Karir</span></li>
              <li><span className="text-sm text-slate-500">Hubungi Kami</span></li>
            </ul>
          </div>

          {/* Links: Bantuan */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Bantuan</h3>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-slate-500">FAQ</span></li>
              <li><span className="text-sm text-slate-500">Syarat & Ketentuan</span></li>
              <li><span className="text-sm text-slate-500">Kebijakan Privasi</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} KurBhan. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  )
}

