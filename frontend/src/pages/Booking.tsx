import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { rateServiceClient, shipmentServiceClient } from '../services/grpcClient';
import { CalculateRateRequest, CreateShipmentRequest } from '../proto/kurbhan_pb';
import { Package, MapPin, Truck, Calculator, Scale, Ruler, ArrowRight, CheckCircle2, Loader2, User } from 'lucide-react';
import { cn } from '../lib/cn';

interface BookingFormData {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  originVillageId: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  destinationVillageId: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  vehicleType: string;
  serviceType: string;
}

export default function Booking() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { } } = useForm<BookingFormData>({
    defaultValues: {
      vehicleType: 'mobil_box_sedang',
      serviceType: 'reguler'
    }
  });
  
  const [rateResult, setRateResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTracking, setSuccessTracking] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const onCalculate = async (data: BookingFormData) => {
    setIsCalculating(true);
    setErrorMsg(null);
    try {
      const req = new CalculateRateRequest();
      req.setOriginVillageId(data.originVillageId);
      req.setDestinationVillageId(data.destinationVillageId);
      req.setActualWeightKg(Number(data.weightKg));
      req.setLengthCm(Number(data.lengthCm));
      req.setWidthCm(Number(data.widthCm));
      req.setHeightCm(Number(data.heightCm));
      req.setVehicleType(data.vehicleType);
      req.setServiceType(data.serviceType);

      const res = await rateServiceClient.calculateRate(req, {});
      setRateResult(res.toObject());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghitung tarif. Periksa kembali data yang dimasukkan.';
      setErrorMsg(message);
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const req = new CreateShipmentRequest();
      req.setUserId(user?.id || '');
      req.setSenderName(data.senderName);
      req.setSenderAddress(data.senderAddress);
      req.setSenderPhone(data.senderPhone);
      req.setOriginVillageId(data.originVillageId);
      req.setReceiverName(data.receiverName);
      req.setReceiverAddress(data.receiverAddress);
      req.setReceiverPhone(data.receiverPhone);
      req.setDestinationVillageId(data.destinationVillageId);
      req.setWeightKg(Number(data.weightKg));
      req.setServiceType(data.serviceType);
      req.setTotalCost(rateResult?.totalPrice || 0);

      const res = await shipmentServiceClient.createShipment(req, {});
      setSuccessTracking(res.toObject().trackingNumber);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat pengiriman. Silakan coba lagi.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (successTracking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Pengiriman Berhasil Dibuat!</h2>
          <p className="mt-2 text-gray-600">Nomor resi Anda:</p>
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <span className="text-xl font-mono font-bold text-indigo-600">{successTracking}</span>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate('/tracking')}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 font-medium"
            >
              Lacak Kiriman
            </button>
            <button
              onClick={() => {
                setSuccessTracking(null);
                setRateResult(null);
              }}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Kirim Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buat Pengiriman Baru</h1>
        <p className="mt-2 text-sm text-gray-600">Isi detail pengirim, penerima, dan informasi paket.</p>
      </div>

      {errorMsg && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-8">
          {/* Pengirim */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6">
              <User className="h-5 w-5 text-indigo-600" /> Pengirim
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengirim</label>
                <input {...register('senderName', { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input {...register('senderPhone', { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea {...register('senderAddress', { required: true })} rows={3} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Desa Asal (Village ID)</label>
                <input {...register('originVillageId', { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
            </div>
          </div>

          {/* Penerima */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6">
              <MapPin className="h-5 w-5 text-indigo-600" /> Penerima
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
                <input {...register('receiverName', { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input {...register('receiverPhone', { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea {...register('receiverAddress', { required: true })} rows={3} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Desa Tujuan (Village ID)</label>
                <input {...register('destinationVillageId', { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
            </div>
          </div>

          {/* Detail Paket */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6">
              <Package className="h-5 w-5 text-indigo-600" /> Detail Paket
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Scale className="w-4 h-4" /> Berat (kg)
                </label>
                <input type="number" step="0.1" {...register('weightKg', { required: true, min: 0.1 })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Ruler className="w-4 h-4" /> Dimensi (P x L x T cm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="Panjang" {...register('lengthCm', { required: true, min: 1 })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                  <input type="number" placeholder="Lebar" {...register('widthCm', { required: true, min: 1 })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                  <input type="number" placeholder="Tinggi" {...register('heightCm', { required: true, min: 1 })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                </div>
              </div>
              <div className="sm:col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-2 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Truck className="w-4 h-4" /> Tipe Kendaraan
                  </label>
                  <select {...register('vehicleType', { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                    <option value="mobil_box_kecil">Mobil Box Kecil</option>
                    <option value="mobil_box_sedang">Mobil Box Sedang</option>
                    <option value="mobil_box_besar">Mobil Box Besar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Layanan</label>
                  <select {...register('serviceType', { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                    <option value="reguler">Reguler</option>
                    <option value="cepat">Cepat</option>
                    <option value="sameday">Sameday</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Action (hidden submit to trigger form handler, actual buttons are in sidebar or at bottom) */}
          <button type="submit" id="submit-booking" className="hidden">Submit</button>
        </form>

        {/* Sidebar: Calculator & Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl bg-slate-50 p-6 shadow-sm ring-1 ring-gray-900/5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <Calculator className="h-5 w-5 text-indigo-600" /> Estimasi Tarif
            </h3>
            
            <button
              type="button"
              onClick={handleSubmit(onCalculate)}
              disabled={isCalculating}
              className="w-full rounded-lg bg-white border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 mb-6"
            >
              {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hitung Tarif
            </button>

            {rateResult ? (
              <div className="space-y-4 text-sm mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Berat Aktual</span>
                  <span className="font-medium text-gray-900">{rateResult.weightKg || watch('weightKg')} kg</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Berat Volumetrik</span>
                  <span className="font-medium text-gray-900">{(rateResult.volumetricWeightKg || 0).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Berat Dikenakan (Chargeable)</span>
                  <span className="font-medium text-gray-900">{(rateResult.chargeableWeightKg || 0).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Lintas Pulau</span>
                  <span className="font-medium text-gray-900">{rateResult.isCrossIsland ? 'Ya' : 'Tidak'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimasi Waktu</span>
                  <span className="font-medium text-gray-900">{rateResult.estimatedDays} Hari</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Total Harga</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {formatRupiah(rateResult.totalPrice || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm text-blue-700">
                Silakan isi data pengirim, penerima, dan detail paket untuk menghitung tarif.
              </div>
            )}

            <button
              onClick={() => document.getElementById('submit-booking')?.click()}
              disabled={isSubmitting || !rateResult}
              className={cn(
                "w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors flex justify-center items-center gap-2",
                !rateResult ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Buat Pengiriman <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
            {!rateResult && (
              <p className="text-xs text-gray-500 mt-2 text-center">Hitung tarif terlebih dahulu untuk membuat pengiriman.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
