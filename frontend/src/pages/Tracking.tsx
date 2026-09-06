import React, { useState } from 'react';
import { TrackShipmentRequest } from '../proto/kurbhan_pb';
import { shipmentServiceClient } from '../services/grpcClient';
import { Search, Package, MapPin, Clock, CheckCircle2, Truck, XCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);
    setHasSearched(true);
    setTrackingResult(null);

    try {
      const req = new TrackShipmentRequest();
      req.setTrackingNumber(trackingNumber.trim());

      const res = await shipmentServiceClient.trackShipment(req, {});
      setTrackingResult(res.toObject());
    } catch (err: any) {
      setErrorMsg(err.message || 'Kiriman tidak ditemukan atau terjadi kesalahan jaringan.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Menunggu' };
      case 'PICKED_UP':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Telah Dijemput' };
      case 'IN_TRANSIT':
        return { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Dalam Perjalanan' };
      case 'OUT_FOR_DELIVERY':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Proses Pengantaran' };
      case 'DELIVERED':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Terkirim' };
      case 'CANCELLED':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Dibatalkan' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status || 'Unknown' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'PICKED_UP': return <Package className="h-5 w-5 text-blue-600" />;
      case 'IN_TRANSIT': return <Truck className="h-5 w-5 text-indigo-600" />;
      case 'OUT_FOR_DELIVERY': return <MapPin className="h-5 w-5 text-purple-600" />;
      case 'DELIVERED': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'CANCELLED': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    // Simplified date formatting, handle proper timestamp conversion based on grpc output
    let dateObj;
    if (timestamp.seconds) {
      dateObj = new Date(timestamp.seconds * 1000);
    } else {
      dateObj = new Date(timestamp);
    }
    
    if (isNaN(dateObj.getTime())) return '-';
    
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(dateObj);
  };

  const shipment = trackingResult?.shipment;
  const history = trackingResult?.historyList || [];
  const currentBadge = shipment ? getStatusBadge(shipment.status) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Lacak Kiriman</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Pantau status pengiriman paket Anda secara real-time dengan memasukkan nomor resi KurBhan di bawah ini.
        </p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm ring-1 ring-gray-900/5 mb-8">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Masukkan nomor resi, contoh: KB-20260901-abc123"
              className="block w-full rounded-xl border-gray-300 pl-11 pr-4 py-3 sm:text-sm focus:border-indigo-500 focus:ring-indigo-500 border bg-gray-50"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !trackingNumber.trim()}
            className="flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors gap-2"
          >
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            Lacak
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-red-50 p-6 text-center shadow-sm border border-red-100">
          <XCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
          <h3 className="text-lg font-medium text-red-800">Pencarian Gagal</h3>
          <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      {!errorMsg && !isSearching && hasSearched && !shipment && (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">Kiriman Tidak Ditemukan</h3>
          <p className="mt-2 text-gray-500">Pastikan nomor resi yang Anda masukkan benar.</p>
        </div>
      )}

      {shipment && (
        <div className="space-y-6">
          {/* Info Card */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
            <div className="border-b border-gray-200 px-6 py-5 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-indigo-600" /> 
                  {shipment.trackingNumber}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Layanan: <span className="font-medium text-gray-900 uppercase">{shipment.serviceType}</span></p>
              </div>
              {currentBadge && (
                <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border", currentBadge.color)}>
                  {currentBadge.label}
                </span>
              )}
            </div>
            
            <div className="px-6 py-6 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Pengirim</h3>
                  <p className="font-medium text-gray-900">{shipment.senderName}</p>
                  <p className="text-sm text-gray-600 mt-1">{shipment.senderAddress}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Penerima</h3>
                  <p className="font-medium text-gray-900">{shipment.receiverName}</p>
                  <p className="text-sm text-gray-600 mt-1">{shipment.receiverAddress}</p>
                </div>
              </div>
              <div className="space-y-4 md:border-l md:border-gray-200 md:pl-8">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Detail Paket</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Berat</p>
                      <p className="font-medium text-gray-900">{shipment.weightKg} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Biaya Total</p>
                      <p className="font-medium text-gray-900">{formatRupiah(shipment.totalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-900/5">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Riwayat Status</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {history.length > 0 ? (
                  history.map((event: any, eventIdx: number) => (
                    <li key={eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== history.length - 1 ? (
                          <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-8 ring-white shadow-sm border border-gray-200">
                              {getStatusIcon(event.status)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 py-0">
                            <div className="text-sm leading-8 text-gray-500">
                              <span className="font-medium text-gray-900 mr-2">
                                {getStatusBadge(event.status).label}
                              </span>
                              <span className="whitespace-nowrap">{formatDate(event.createdAt)}</span>
                            </div>
                            <div className="mt-1 text-sm text-gray-700">
                              <p>{event.description}</p>
                              {event.location && (
                                <p className="mt-1 flex items-center text-xs text-gray-500">
                                  <MapPin className="mr-1 h-3 w-3" /> {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Belum ada riwayat update untuk kiriman ini.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
