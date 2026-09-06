import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Package, Send, Search, Clock, CheckCircle2, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) return null;

  // Placeholder stats since there's no API for list shipments yet
  const stats = [
    { name: 'Total Pengiriman', value: '0', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Dalam Proses', value: '0', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Selesai', value: '0', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Welcome */}
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Selamat datang, {user.fullName}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Kelola dan pantau semua pengiriman paket Anda di satu tempat.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
          <Link
            to="/tracking"
            className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 gap-2"
          >
            <Search className="h-4 w-4 text-gray-500" />
            Lacak Kiriman
          </Link>
          <Link
            to="/booking"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 gap-2"
          >
            <Send className="h-4 w-4" />
            Kirim Paket Baru
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6">
            <div className="flex items-center">
              <div className={cn("flex-shrink-0 rounded-md p-3", item.bg)}>
                <item.icon className={cn("h-6 w-6", item.color)} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Shipments Section */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Riwayat Pengiriman Terbaru</h3>
          <Link to="/booking" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {/* Placeholder table / empty state */}
        <div className="px-4 py-12 sm:px-6 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada riwayat pengiriman</h3>
          <p className="mt-1 text-sm text-gray-500">Mulai kirim paket sekarang dan pantau riwayatnya di sini.</p>
          <div className="mt-6">
            <Link
              to="/booking"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 gap-2"
            >
              <Package className="h-4 w-4" />
              Buat Pengiriman Pertama
            </Link>
          </div>
        </div>
        
        {/* Real table structure (hidden for now since no data) */}
        <div className="hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">No. Resi</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Penerima</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Rows will go here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
