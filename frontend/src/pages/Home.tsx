import { Link } from 'react-router-dom';
import { MapPin, Truck, Calculator, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-indigo-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Kirim Paket ke Seluruh Indonesia
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto mb-10">
            KurBhan adalah platform logistik terpercaya dengan tarif transparan dan pelacakan real-time. Nikmati pengiriman cepat dan aman ke seluruh pelosok negeri.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/booking"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Kirim Sekarang <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/tracking"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-md text-white border border-indigo-400 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Lacak Kiriman <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Mengapa Memilih KurBhan?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Kami memberikan layanan terbaik untuk memastikan paket Anda sampai dengan aman dan tepat waktu.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Tarif Transparan</h3>
              <p className="text-slate-600">Hitung ongkos kirim dengan mudah sebelum mengirim. Tidak ada biaya tersembunyi.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Tracking Real-Time</h3>
              <p className="text-slate-600">Pantau perjalanan paket Anda kapan saja dan di mana saja dengan fitur live tracking kami.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Pengiriman Cepat</h3>
              <p className="text-slate-600">Jaringan logistik yang luas memastikan pengiriman tepat waktu ke tujuan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Cara Kerja</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Tiga langkah mudah untuk mengirim paket dengan KurBhan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-indigo-200" aria-hidden="true" />
            
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold z-10 mb-6 shadow-lg shadow-indigo-200">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Isi Form Pengiriman</h3>
              <p className="text-slate-600">Masukkan detail pengirim, penerima, dan informasi paket.</p>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold z-10 mb-6 shadow-lg shadow-indigo-200">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Bayar & Kirim</h3>
              <p className="text-slate-600">Pilih metode pembayaran dan serahkan paket ke kurir kami.</p>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold z-10 mb-6 shadow-lg shadow-indigo-200">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Lacak Paket</h3>
              <p className="text-slate-600">Gunakan nomor resi untuk melacak status pengiriman secara real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Mulai Kirim Paket Sekarang</h2>
        <p className="text-indigo-200 max-w-2xl mx-auto mb-10 text-lg">
          Bergabunglah dengan ribuan pengguna lain yang telah mempercayakan pengiriman mereka kepada KurBhan.
        </p>
        <Link
          to="/booking"
          className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-md text-indigo-900 bg-white hover:bg-indigo-50 transition-colors shadow-lg"
        >
          Kirim Paket <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}
