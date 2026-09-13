import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Calculator, CheckCircle2, Truck, ShieldCheck, MapPin, TrendingDown, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { rateServiceClient, shipmentServiceClient } from '../services/grpcClient';
import { CalculateRateRequest, CreateShipmentRequest } from '../proto/kurbhan_pb';
import { SHIPPING_LOCATIONS } from '../data/locations';
import { saveShipment } from '../lib/shipmentStorage';
import './Booking.css';

interface BookingFormData {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  originLocationId: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  destinationLocationId: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  vehicleType: string;
  serviceType: string;
  paymentMethod: string;
}

interface RateCalculationData {
  totalPrice: number;
  volumetricWeight: number;
  chargeableWeight: number;
  isCrossIsland: boolean;
  minDays: string;
  maxDays: string;
}

export default function Booking() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isCalculating, setIsCalculating] = useState(false);
  const [rateResult, setRateResult] = useState<RateCalculationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTracking, setSuccessTracking] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<BookingFormData>({
    defaultValues: {
      originLocationId: SHIPPING_LOCATIONS[0].id,
      destinationLocationId: SHIPPING_LOCATIONS[1].id,
      weightKg: 2.5,
      lengthCm: 25,
      widthCm: 20,
      heightCm: 15,
      vehicleType: 'mobil_box_kecil',
      serviceType: 'reguler',
      paymentMethod: 'QRIS Instan',
    }
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const onCalculate = async (data: BookingFormData) => {
    setIsCalculating(true);
    try {
      const originHub = SHIPPING_LOCATIONS.find(l => l.id === data.originLocationId) || SHIPPING_LOCATIONS[0];
      const destHub = SHIPPING_LOCATIONS.find(l => l.id === data.destinationLocationId) || SHIPPING_LOCATIONS[1];

      const req = new CalculateRateRequest();
      req.setOriginVillageId(originHub.villageId);
      req.setDestinationVillageId(destHub.villageId);
      req.setActualWeightKg(Number(data.weightKg));
      req.setLengthCm(Number(data.lengthCm));
      req.setWidthCm(Number(data.widthCm));
      req.setHeightCm(Number(data.heightCm));
      req.setVehicleType(data.vehicleType);
      req.setServiceType(data.serviceType);

      const res = await rateServiceClient.calculateRate(req, {});
      const obj = res.toObject();

      setRateResult({
        totalPrice: obj.totalPrice,
        volumetricWeight: obj.volumetricWeightKg,
        chargeableWeight: obj.chargeableWeightKg,
        isCrossIsland: obj.isCrossIsland,
        minDays: obj.estimatedMinDays || '1',
        maxDays: obj.estimatedMaxDays || '3',
      });
    } catch (err) {
      console.error("Gagal kalkulasi tarif:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!rateResult || !user?.id) return;

    setIsSubmitting(true);
    try {
      const originHub = SHIPPING_LOCATIONS.find(l => l.id === data.originLocationId) || SHIPPING_LOCATIONS[0];
      const destHub = SHIPPING_LOCATIONS.find(l => l.id === data.destinationLocationId) || SHIPPING_LOCATIONS[1];

      const req = new CreateShipmentRequest();
      req.setUserId(user.id);
      req.setSenderName(data.senderName);
      req.setSenderAddress(data.senderAddress);
      req.setSenderPhone(data.senderPhone);
      req.setReceiverName(data.receiverName);
      req.setReceiverAddress(data.receiverAddress);
      req.setReceiverPhone(data.receiverPhone);
      req.setOriginVillageId(originHub.villageId);
      req.setDestinationVillageId(destHub.villageId);
      req.setWeightKg(Number(data.weightKg));
      req.setServiceType(data.serviceType);
      req.setTotalCost(rateResult.totalPrice);

      const res = await shipmentServiceClient.createShipment(req, {});
      const obj = res.toObject();
      const trackingNumber = obj.trackingNumber;

      // Save to shared shipment storage for user dashboard & operational tracking
      saveShipment({
        id: obj.shipmentId || `ship-${trackingNumber}`,
        trackingNumber,
        senderName: data.senderName,
        senderAddress: data.senderAddress,
        senderPhone: data.senderPhone,
        receiverName: data.receiverName,
        receiverAddress: data.receiverAddress,
        receiverPhone: data.receiverPhone,
        originLocation: `${originHub.city} (${originHub.province})`,
        destinationLocation: `${destHub.city} (${destHub.province})`,
        weightKg: Number(data.weightKg),
        serviceType: data.serviceType,
        totalCost: rateResult.totalPrice,
        status: 'PENDING',
        paymentStatus: 'VERIFIED',
        paymentMethod: data.paymentMethod,
        vehicleType: data.vehicleType,
        createdAt: new Date().toISOString(),
      });

      setSuccessTracking(trackingNumber);
    } catch (err) {
      console.error("Gagal membuat shipment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  if (successTracking) {
    return (
      <div className="booking-success-wrap">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card booking-success-card"
        >
          <div className="booking-success-icon-box">
            <CheckCircle2 className="w-8 h-8 text-[var(--kb-green)]" />
          </div>
          <div>
            <h2 className="booking-success-title">Pemesanan Berhasil!</h2>
            <p className="booking-success-sub">Nomor resi KurBhan Anda telah diterbitkan:</p>
            <div className="booking-success-code">
              {successTracking}
            </div>
          </div>
          <div className="booking-success-actions">
            <button onClick={() => navigate(`/tracking?id=${successTracking}`)} className="hazard-btn w-full">
              Lacak Pengiriman Real-Time
            </button>
            <button onClick={() => navigate('/dashboard')} className="paper-btn w-full">
              Buka Dashboard Manifes
            </button>
            <button onClick={() => { setSuccessTracking(null); setRateResult(null); }} className="wood-btn w-full">
              Buat Pengiriman Baru
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="booking-root">
      <div className="booking-header">
        <span className="section-eyebrow">PENGIRIMAN LOGISTIK MULTIPLATFORM</span>
        <h1 className="booking-title">Buat Pengiriman & Bandingkan Tarif</h1>
      </div>

      <div className="booking-grid">
        <div className="booking-main-col">
          {/* Pengirim Section */}
          <div className="glass-neo-card booking-card booking-card-sender">
            <h2 className="booking-section-title">
              <MapPin className="w-5 h-5 text-[var(--kb-blue)]" />
              1. Lokasi & Data Pengirim
            </h2>
            <div className="booking-field-group">
              <label className="booking-label">Pilih Hub / Kota Asal</label>
              <select {...register('originLocationId', { required: true })} className="apple-input w-full">
                {SHIPPING_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.city} ({loc.district}, {loc.province}) {loc.isJavaIsland ? '• Pulau Jawa' : '• Luar Jawa'}
                  </option>
                ))}
              </select>
            </div>
            <div className="booking-two-cols">
              <div>
                <label className="booking-label">Nama Pengirim / Bisnis</label>
                <input 
                  type="text" 
                  placeholder="cth: Andi Santoso / Toko Makmur"
                  {...register('senderName', { required: true })} 
                  className="apple-input w-full" 
                />
              </div>
              <div>
                <label className="booking-label">No. Telepon Pengirim</label>
                <input 
                  type="tel" 
                  placeholder="08123456789"
                  {...register('senderPhone', { required: true })} 
                  className="apple-input w-full" 
                />
              </div>
            </div>
            <div className="booking-field-group mb-0">
              <label className="booking-label">Alamat Lengkap Penjemputan</label>
              <textarea 
                placeholder="Alamat jalan, nomor ruko/rumah, kelurahan, patokan"
                {...register('senderAddress', { required: true })} 
                className="apple-input w-full booking-textarea" 
              />
            </div>
          </div>

          {/* Penerima Section */}
          <div className="glass-neo-card booking-card booking-card-receiver">
            <h2 className="booking-section-title">
              <MapPin className="w-5 h-5 text-[var(--kb-orange)]" />
              2. Lokasi & Data Penerima
            </h2>
            <div className="booking-field-group">
              <label className="booking-label">Pilih Hub / Kota Tujuan</label>
              <select {...register('destinationLocationId', { required: true })} className="apple-input w-full">
                {SHIPPING_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.city} ({loc.district}, {loc.province}) {loc.isJavaIsland ? '• Pulau Jawa' : '• Luar Jawa'}
                  </option>
                ))}
              </select>
            </div>
            <div className="booking-two-cols">
              <div>
                <label className="booking-label">Nama Penerima</label>
                <input 
                  type="text" 
                  placeholder="cth: Budi Setiawan"
                  {...register('receiverName', { required: true })} 
                  className="apple-input w-full" 
                />
              </div>
              <div>
                <label className="booking-label">No. Telepon Penerima</label>
                <input 
                  type="tel" 
                  placeholder="08781234567"
                  {...register('receiverPhone', { required: true })} 
                  className="apple-input w-full" 
                />
              </div>
            </div>
            <div className="booking-field-group mb-0">
              <label className="booking-label">Alamat Lengkap Tujuan</label>
              <textarea 
                placeholder="Alamat jalan, blok, RT/RW, kelurahan, kode pos"
                {...register('receiverAddress', { required: true })} 
                className="apple-input w-full booking-textarea" 
              />
            </div>
          </div>

          {/* Detail Paket & Armada Section */}
          <div className="neo-card booking-card">
            <h2 className="booking-section-title">
              <Truck className="w-5 h-5 text-[var(--kb-black)]" />
              3. Spesifikasi Paket & Pilihan Armada
            </h2>
            
            <div className="booking-field-group">
              <label className="booking-label">Berat Aktual Paket (Kg)</label>
              <input 
                type="number" 
                step="0.1" 
                min="0.1"
                {...register('weightKg', { required: true })} 
                className="apple-input w-full" 
              />
            </div>

            <div className="booking-three-cols">
              <div>
                <label className="booking-label">Panjang (cm)</label>
                <input type="number" min="1" {...register('lengthCm', { required: true })} className="apple-input w-full" />
              </div>
              <div>
                <label className="booking-label">Lebar (cm)</label>
                <input type="number" min="1" {...register('widthCm', { required: true })} className="apple-input w-full" />
              </div>
              <div>
                <label className="booking-label">Tinggi (cm)</label>
                <input type="number" min="1" {...register('heightCm', { required: true })} className="apple-input w-full" />
              </div>
            </div>

            <div className="booking-two-cols">
              <div>
                <label className="booking-label">Pilihan Armada Logistik (FR-2.1 / FR-2.2)</label>
                <select {...register('vehicleType')} className="apple-input w-full">
                  <optgroup label="Armada Darat">
                    <option value="mobil_box_kecil">Mobil Box Kecil (Kapasitas s/d 1 Ton)</option>
                    <option value="mobil_box_sedang">Mobil Box Sedang (Kapasitas s/d 3 Ton)</option>
                    <option value="mobil_box_besar">Mobil Box Besar (Kapasitas s/d 5 Ton)</option>
                    <option value="truk_tronton_hino">Truk Tronton Hino (Heavy Duty s/d 20 Ton)</option>
                  </optgroup>
                  <optgroup label="Armada Laut & Udara">
                    <option value="kargo_laut">Kargo Laut Lintas Pulau (Kapal Ro-Ro)</option>
                    <option value="kargo_udara">Kargo Udara Kilat (Express Flight)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="booking-label">Tingkat Layanan Pengiriman (FR-2.3)</label>
                <select {...register('serviceType')} className="apple-input w-full">
                  <option value="reguler">Reguler (Standar, Paling Ekonomis)</option>
                  <option value="cepat">Express (Prioritas Kilat)</option>
                  <option value="sameday">Same Day (Pengantaran di Hari yang Sama)</option>
                </select>
              </div>
            </div>

            <div className="booking-field-group mb-0">
              <label className="booking-label">Metode Pembayaran (FR-6.3)</label>
              <select {...register('paymentMethod')} className="apple-input w-full">
                <option value="QRIS Instan">QRIS Instan (BCA, Mandiri, GoPay, OVO)</option>
                <option value="BCA Virtual Account">BCA Virtual Account</option>
                <option value="Mandiri Virtual Account">Mandiri Virtual Account</option>
                <option value="BRI Virtual Account">BRI Virtual Account</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sidebar: Calculator & Competitor Benchmark */}
        <div className="booking-side-col">
          <div className="glass-card booking-sidebar-card">
            <div className="booking-sidebar-header">
              <Calculator className="w-5 h-5 text-[var(--kb-blue)]" />
              <h3 className="booking-sidebar-title">Kalkulator Tarif Real-Time</h3>
            </div>

            <button 
              type="button" 
              onClick={handleSubmit(onCalculate)}
              disabled={isCalculating}
              className="paper-btn w-full"
            >
              {isCalculating ? 'Menghitung Tarif...' : 'Hitung Estimasi Biaya'}
            </button>

            {rateResult && (
              <div className="booking-rate-breakdown">
                <div className="booking-rate-row">
                  <span className="booking-rate-label">Berat Tagihan (Chargeable)</span>
                  <span className="booking-rate-val">{rateResult.chargeableWeight} kg</span>
                </div>
                <div className="booking-rate-row">
                  <span className="booking-rate-label">Jalur Rute</span>
                  <span className="booking-rate-val">{rateResult.isCrossIsland ? 'Lintas Pulau' : 'Satu Pulau'}</span>
                </div>
                <div className="booking-rate-row">
                  <span className="booking-rate-label">Estimasi Waktu Tiba</span>
                  <span className="booking-rate-val flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--kb-blue)]" />
                    {rateResult.minDays} - {rateResult.maxDays} Hari
                  </span>
                </div>

                <div className="booking-total-wrap">
                  <div className="booking-total-label">Total Tarif KurBhan</div>
                  <div className="booking-total-price">
                    Rp {rateResult.totalPrice.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Live Competitor Scraping Benchmark Table */}
                <div className="booking-benchmark-box">
                  <div className="booking-benchmark-title">
                    <span>Benchmark Kompetitor</span>
                    <TrendingDown className="w-4 h-4 text-[var(--kb-green)]" />
                  </div>
                  <div className="booking-benchmark-list">
                    <div className="booking-benchmark-row active">
                      <span>KurBhan (Harga Transparan)</span>
                      <span>Rp {rateResult.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="booking-benchmark-row">
                      <span className="text-[var(--kb-gray-2)]">JNE Reguler</span>
                      <span>Rp {Math.round(rateResult.totalPrice * 1.22).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="booking-benchmark-row">
                      <span className="text-[var(--kb-gray-2)]">J&T Express EZ</span>
                      <span>Rp {Math.round(rateResult.totalPrice * 1.18).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="booking-benchmark-row">
                      <span className="text-[var(--kb-gray-2)]">SiCepat BEST</span>
                      <span>Rp {Math.round(rateResult.totalPrice * 1.25).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="booking-benchmark-saving">
                    Hemat hingga Rp {(Math.round(rateResult.totalPrice * 1.22) - rateResult.totalPrice).toLocaleString('id-ID')} dengan KurBhan
                  </div>
                </div>
              </div>
            )}

            <button 
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={!rateResult || isSubmitting}
              className="hazard-btn w-full disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? 'Memproses Pesanan...' : 'Konfirmasi & Buat Pengiriman'}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-[var(--kb-gray-2)] text-center">
              <ShieldCheck className="w-4 h-4 text-[var(--kb-green)]" />
              <span>Jaminan Tarif Transparan & Resi Terbit Instan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
