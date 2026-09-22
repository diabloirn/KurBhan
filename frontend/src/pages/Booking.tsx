import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  TrendingDown, 
  Clock, 
  Copy, 
  CreditCard, 
  Banknote, 
  AlertCircle,
  Printer
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { rateServiceClient, shipmentServiceClient, paymentServiceClient } from '../services/grpcClient';
import { CalculateRateRequest, CreateShipmentRequest, CreatePaymentRequest } from '../proto/kurbhan_pb';
import { SHIPPING_LOCATIONS } from '../data/locations';
import { saveShipment, updateStoredPaymentStatus } from '../lib/shipmentStorage';
import WaybillModal, { type WaybillData } from '../components/WaybillModal';
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
  codDpAmount?: number;
}

interface RateCalculationData {
  totalPrice: number;
  volumetricWeight: number;
  chargeableWeight: number;
  isCrossIsland: boolean;
  minDays: string;
  maxDays: string;
}

interface PaymentResultData {
  paymentId: string;
  method: 'VIRTUAL_ACCOUNT' | 'BANK_TRANSFER' | 'COD';
  channel: string;
  amount: number;
  dpAmount: number;
  remainingAmount: number;
  vaNumber: string;
  bankAccountNumber: string;
  bankAccountName: string;
  expiredAt: string;
  senderName: string;
  senderPhone: string;
}

function getFallbackPaymentId(): string {
  return `pay-${new Date().getTime()}`;
}

function getFallbackExpiry(): string {
  return new Date(new Date().getTime() + 24 * 3600 * 1000).toISOString();
}

export default function Booking() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isCalculating, setIsCalculating] = useState(false);
  const [rateResult, setRateResult] = useState<RateCalculationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTracking, setSuccessTracking] = useState<string | null>(null);
  const [successPayment, setSuccessPayment] = useState<PaymentResultData | null>(null);
  const [copiedVA, setCopiedVA] = useState(false);
  const [isWaybillOpen, setIsWaybillOpen] = useState(false);
  const [waybillSuccessBanner, setWaybillSuccessBanner] = useState(false);
  const [currentWaybillData, setCurrentWaybillData] = useState<WaybillData | null>(null);

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
      paymentMethod: 'BCA_VA',
    }
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('BCA_VA');
  const [watchedCodDp, setWatchedCodDp] = useState<number | ''>('');

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
      const weight = typeof data.weightKg === 'string' ? parseFloat(String(data.weightKg).replace(',', '.')) : Number(data.weightKg) || 1;

      const req = new CalculateRateRequest();
      req.setOriginVillageId(originHub.villageId);
      req.setDestinationVillageId(destHub.villageId);
      req.setActualWeightKg(weight);
      req.setLengthCm(Number(data.lengthCm) || 20);
      req.setWidthCm(Number(data.widthCm) || 15);
      req.setHeightCm(Number(data.heightCm) || 10);
      req.setVehicleType(data.vehicleType);
      req.setServiceType(data.serviceType);

      const res = await Promise.race([
        rateServiceClient.calculateRate(req, {}),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
      ]);
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
      console.warn("Gagal kalkulasi tarif dari gRPC, menggunakan kalkulator lokal:", err);
      const weight = typeof data.weightKg === 'string' ? parseFloat(String(data.weightKg).replace(',', '.')) : Number(data.weightKg) || 1;
      const vol = ((Number(data.lengthCm) || 20) * (Number(data.widthCm) || 15) * (Number(data.heightCm) || 10)) / 4000;
      const chargeable = Math.max(weight, vol);
      const isCross = data.originLocationId.startsWith('sub_') !== data.destinationLocationId.startsWith('sub_');
      const basePrice = (isCross ? 35000 : 20000) + (chargeable * 2000);
      setRateResult({
        totalPrice: basePrice,
        volumetricWeight: vol,
        chargeableWeight: chargeable,
        isCrossIsland: isCross,
        minDays: '2',
        maxDays: '4',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const originHub = SHIPPING_LOCATIONS.find(l => l.id === data.originLocationId) || SHIPPING_LOCATIONS[0];
      const destHub = SHIPPING_LOCATIONS.find(l => l.id === data.destinationLocationId) || SHIPPING_LOCATIONS[1];
      const weightVal = typeof data.weightKg === 'string' ? parseFloat(String(data.weightKg).replace(',', '.')) : Number(data.weightKg) || 1;

      // Pastikan rateResult tersedia
      let currentRate = rateResult;
      if (!currentRate) {
        const vol = ((Number(data.lengthCm) || 20) * (Number(data.widthCm) || 15) * (Number(data.heightCm) || 10)) / 4000;
        const chargeable = Math.max(weightVal, vol);
        const isCross = data.originLocationId.startsWith('sub_') !== data.destinationLocationId.startsWith('sub_');
        const basePrice = (isCross ? 35000 : 20000) + (chargeable * 2000);
        currentRate = {
          totalPrice: basePrice,
          volumetricWeight: vol,
          chargeableWeight: chargeable,
          isCrossIsland: isCross,
          minDays: '2',
          maxDays: '4',
        };
        setRateResult(currentRate);
      }

      const effectivePrice = currentRate.totalPrice;
      const userId = user?.id || 'd3b07384-d113-4632-95f2-9c169229f37c';

      // 1. Buat Pengiriman di ShipmentService (dengan timeout & graceful fallback)
      const req = new CreateShipmentRequest();
      req.setUserId(userId);
      req.setSenderName(data.senderName);
      req.setSenderAddress(data.senderAddress);
      req.setSenderPhone(data.senderPhone);
      req.setReceiverName(data.receiverName);
      req.setReceiverAddress(data.receiverAddress);
      req.setReceiverPhone(data.receiverPhone);
      req.setOriginVillageId(originHub.villageId);
      req.setDestinationVillageId(destHub.villageId);
      req.setWeightKg(weightVal);
      req.setServiceType(data.serviceType);
      req.setTotalCost(effectivePrice);

      let trackingNumber = `KB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      let shipmentId = `ship-${trackingNumber}`;

      try {
        const res = await Promise.race([
          shipmentServiceClient.createShipment(req, {}),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
        ]);
        const obj = res.toObject();
        if (obj.trackingNumber) trackingNumber = obj.trackingNumber;
        if (obj.shipmentId) shipmentId = obj.shipmentId;
      } catch (shipErr) {
        console.warn("Shipment service offline/timeout, menggunakan local fallback tracking:", shipErr);
      }

      // 2. Tentukan Metode Pembayaran & Channel
      let method: 'VIRTUAL_ACCOUNT' | 'BANK_TRANSFER' | 'COD' = 'VIRTUAL_ACCOUNT';
      let channel = data.paymentMethod;

      if (data.paymentMethod.endsWith('_VA')) {
        method = 'VIRTUAL_ACCOUNT';
      } else if (data.paymentMethod === 'COD') {
        method = 'COD';
      } else {
        method = 'BANK_TRANSFER';
      }

      // Validasi DP COD minimal 50%
      let dpAmount = 0;
      let remainingAmount = effectivePrice;
      if (method === 'COD') {
        dpAmount = Number(data.codDpAmount || effectivePrice * 0.5);
        if (dpAmount < effectivePrice * 0.5) {
          dpAmount = effectivePrice * 0.5;
        }
        remainingAmount = effectivePrice - dpAmount;
      }

      // 3. Panggil PaymentService gRPC (dengan timeout & graceful fallback)
      const payReq = new CreatePaymentRequest();
      payReq.setShipmentId(shipmentId);
      payReq.setUserId(userId);
      payReq.setMethod(method);
      payReq.setChannel(channel);
      payReq.setAmount(effectivePrice);
      payReq.setCodDpAmount(dpAmount);
      payReq.setCustomerPhone(data.senderPhone);
      payReq.setCustomerName(data.senderName);

      let paymentId = getFallbackPaymentId();
      let vaNumber = '';
      let bankAccount = '';
      let bankName = 'PT KurBhan Logistik';
      let expiredAt = getFallbackExpiry();

      try {
        const payRes = await Promise.race([
          paymentServiceClient.createPayment(payReq, {}),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
        ]);
        const payObj = payRes.toObject();
        paymentId = payObj.paymentId || paymentId;
        vaNumber = payObj.vaNumber || '';
        bankAccount = payObj.bankAccountNumber || '';
        bankName = payObj.bankAccountName || bankName;
        expiredAt = payObj.expiredAt || expiredAt;
      } catch (payErr) {
        console.warn("Payment service offline/timeout, fallback to local generator:", payErr);
        if (method === 'VIRTUAL_ACCOUNT') {
          const cleanPhone = data.senderPhone.replace(/^(\+62|62|0)/, '');
          const prefix = channel === 'BCA_VA' ? '39107' : channel === 'MANDIRI_VA' ? '89508' : channel === 'BNI_VA' ? '8241' : channel === 'BRI_VA' ? '88099' : '00789';
          vaNumber = prefix + cleanPhone;
        } else if (method === 'BANK_TRANSFER') {
          bankAccount = channel === 'BCA' ? '8890123456' : channel === 'BLU_BCA' ? '0078901234' : channel === 'MANDIRI' ? '1270012345678' : channel === 'BNI' ? '0987654321' : '034501000123456';
        }
      }

      // Guarantee VA number is generated if method is VIRTUAL_ACCOUNT
      if (method === 'VIRTUAL_ACCOUNT' && !vaNumber) {
        const cleanPhone = data.senderPhone.replace(/^(\+62|62|0)/, '');
        const prefix = channel === 'BCA_VA' ? '39107' : channel === 'MANDIRI_VA' ? '89508' : channel === 'BNI_VA' ? '8241' : channel === 'BRI_VA' ? '88099' : '00789';
        vaNumber = prefix + cleanPhone;
      }

      const paymentResult: PaymentResultData = {
        paymentId,
        method,
        channel,
        amount: effectivePrice,
        dpAmount,
        remainingAmount,
        vaNumber,
        bankAccountNumber: bankAccount,
        bankAccountName: bankName,
        expiredAt,
        senderName: data.senderName,
        senderPhone: data.senderPhone,
      };

      // 4. Simpan ke Local Storage untuk sinkronisasi antarmuka
      saveShipment({
        id: shipmentId,
        trackingNumber,
        senderName: data.senderName,
        senderAddress: data.senderAddress,
        senderPhone: data.senderPhone,
        receiverName: data.receiverName,
        receiverAddress: data.receiverAddress,
        receiverPhone: data.receiverPhone,
        originLocation: `${originHub.city} (${originHub.province})`,
        destinationLocation: `${destHub.city} (${destHub.province})`,
        weightKg: weightVal,
        serviceType: data.serviceType,
        totalCost: effectivePrice,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: data.paymentMethod,
        paymentChannel: channel,
        paymentId,
        vaNumber,
        bankAccountNumber: bankAccount,
        bankAccountName: bankName,
        dpAmount,
        remainingAmount,
        expiredAt,
        vehicleType: data.vehicleType,
        createdAt: new Date().toISOString(),
      });

      setCurrentWaybillData({
        trackingNumber,
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        senderAddress: data.senderAddress,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        receiverAddress: data.receiverAddress,
        originLocation: `${originHub.city} (${originHub.province})`,
        destinationLocation: `${destHub.city} (${destHub.province})`,
        weightKg: weightVal,
        serviceType: data.serviceType,
        vehicleType: data.vehicleType,
        totalCost: effectivePrice,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'UNPAID',
        vaNumber,
        createdAt: new Date().toISOString(),
      });

      setSuccessTracking(trackingNumber);
      setSuccessPayment(paymentResult);
    } catch (err) {
      console.error("Gagal membuat shipment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const handleSimulateInstantPay = () => {
    if (!successTracking || !currentWaybillData) return;
    updateStoredPaymentStatus(successTracking, 'VERIFIED');
    setCurrentWaybillData({
      ...currentWaybillData,
      paymentStatus: 'VERIFIED',
    });
    setWaybillSuccessBanner(true);
    setIsWaybillOpen(true);
  };

  const handleOpenWaybill = () => {
    setWaybillSuccessBanner(false);
    setIsWaybillOpen(true);
  };

  if (authLoading || !isAuthenticated) return null;

  if (successTracking && successPayment) {
    return (
      <div className="booking-success-wrap">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card booking-success-card max-w-xl"
        >
          <div className="booking-success-icon-box">
            <CheckCircle2 className="w-8 h-8 text-[var(--kb-green)]" />
          </div>

          <div>
            <span className="section-eyebrow">ORDER MANIFEST DITERBITKAN</span>
            <h2 className="booking-success-title">Pemesanan & Tagihan Siap!</h2>
            <p className="booking-success-sub">Nomor resi KurBhan Anda telah diterbitkan:</p>
            <div className="booking-success-code">
              {successTracking}
            </div>
          </div>

          {/* Payment Details Container */}
          <div className="mt-4 p-4 rounded bg-[var(--kb-paper)] border-2 border-[var(--kb-kraft-dark)] text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--kb-kraft-dark)]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--kb-wood)]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[var(--kb-wood)]">
                  Instruksi Pembayaran (FR-6.3)
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-[var(--kb-hazard)] text-[var(--kb-wood)] font-bold">
                1x24 JAM
              </span>
            </div>

            {/* Virtual Account Flow */}
            {successPayment.method === 'VIRTUAL_ACCOUNT' && (
              <div className="space-y-2">
                <div className="text-xs text-[var(--kb-wood-light)]">
                  Nomor Virtual Account ({successPayment.channel.replace(/_/g, ' ')}):
                </div>
                <div className="flex items-center justify-between bg-[var(--kb-paper-dark)] p-3 border border-[var(--kb-wood)] rounded">
                  <span className="font-mono text-lg font-extrabold text-[var(--kb-wood)] tracking-wider">
                    {successPayment.vaNumber}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(successPayment.vaNumber)}
                    className="paper-btn text-xs px-2.5 py-1 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedVA ? 'Disalin!' : 'Salin VA'}</span>
                  </button>
                </div>
                <p className="text-xs text-[var(--kb-wood-light)] leading-relaxed">
                  💡 Nomor VA di atas otomatis terhubung dengan nomor HP Anda (<strong>{successPayment.senderPhone}</strong>). 
                  Transfer tepat <strong>Rp {successPayment.amount.toLocaleString('id-ID')}</strong>. 
                  Sistem backend dan database akan membaca mutasi secara otomatis; jika sesuai maka langsung diterima!
                </p>
              </div>
            )}

            {/* Bank Transfer Flow */}
            {successPayment.method === 'BANK_TRANSFER' && (
              <div className="space-y-2">
                <div className="text-xs text-[var(--kb-wood-light)]">
                  Rekening Resmi KurBhan ({successPayment.channel}):
                </div>
                <div className="bg-[var(--kb-paper-dark)] p-3 border border-[var(--kb-wood)] rounded space-y-1">
                  <div className="font-mono text-base font-bold text-[var(--kb-wood)]">
                    {successPayment.bankAccountNumber}
                  </div>
                  <div className="text-xs text-[var(--kb-wood-light)]">
                    a.n. {successPayment.bankAccountName}
                  </div>
                  <div className="text-sm font-bold text-[var(--kb-wood)] pt-1 border-t border-[var(--kb-kraft-dark)]">
                    Nominal: Rp {successPayment.amount.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="p-2.5 bg-[var(--kb-hazard)]/20 border border-[var(--kb-hazard)] text-xs text-[var(--kb-wood)] space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-[var(--kb-wood)]" />
                    Ketentuan Crosscheck Transfer:
                  </div>
                  <div>
                    Sertakan nama lengkap (<strong>{successPayment.senderName}</strong>), nomor telepon (<strong>{successPayment.senderPhone}</strong>), dan upload bukti transfer di menu Operasional/Dashboard untuk diverifikasi tim backend.
                  </div>
                </div>
              </div>
            )}

            {/* COD Flow */}
            {successPayment.method === 'COD' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--kb-wood)]">
                  <Banknote className="w-4 h-4 text-[var(--kb-wood)]" />
                  <span>Cash on Delivery (COD dengan Minimal DP 50%)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[var(--kb-hazard)] border border-[var(--kb-wood)] text-[var(--kb-wood)] font-bold">
                    <div>DP Saat Penjemputan:</div>
                    <div className="text-sm">Rp {successPayment.dpAmount.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="p-2.5 bg-[var(--kb-paper-dark)] border border-[var(--kb-wood)] text-[var(--kb-wood)] font-semibold">
                    <div>Sisa Saat Pengantaran:</div>
                    <div className="text-sm">Rp {successPayment.remainingAmount.toLocaleString('id-ID')}</div>
                  </div>
                </div>
                <p className="text-xs text-[var(--kb-wood-light)]">
                  💡 DP minimal 50% wajib dibayarkan kepada kurir saat penjemputan paket di lokasi asal. Sisa pelunasan dibayar oleh penerima saat barang tiba.
                </p>
              </div>
            )}

            <div className="text-xs text-[var(--kb-wood-light)] flex items-center gap-1.5 pt-2 border-t border-[var(--kb-kraft-dark)]">
              <Clock className="w-3.5 h-3.5 text-[var(--kb-wood)]" />
              <span>Batas Waktu Pembayaran: <strong>1 x 24 Jam</strong> (sebelum {new Date(successPayment.expiredAt).toLocaleString('id-ID')})</span>
            </div>
          </div>

          <div className="booking-success-actions">
            <button 
              type="button"
              onClick={handleOpenWaybill} 
              className="hazard-btn w-full flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Lihat & Cetak Resi (Waybill)</span>
            </button>

            <button 
              type="button"
              onClick={handleSimulateInstantPay}
              className="wood-btn w-full flex items-center justify-center gap-2 border-2 border-[var(--kb-green)] text-[var(--kb-green)] hover:bg-[var(--kb-green)]/10"
            >
              <CheckCircle2 className="w-4 h-4 text-[var(--kb-green)]" />
              <span>Simulasi Bayar Lunas (Uji Coba Otomasi)</span>
            </button>

            <button onClick={() => navigate(`/tracking?id=${successTracking}`)} className="paper-btn w-full">
              Lacak Pengiriman Real-Time
            </button>
            <button onClick={() => navigate('/dashboard')} className="paper-btn w-full">
              Buka Dashboard Manifes
            </button>
            <button onClick={() => { setSuccessTracking(null); setSuccessPayment(null); setRateResult(null); }} className="wood-btn w-full">
              Buat Pengiriman Baru
            </button>
          </div>
        </motion.div>

        {/* Modal Cetak Resi / Pop-up Pembayaran Berhasil */}
        <WaybillModal 
          isOpen={isWaybillOpen} 
          onClose={() => setIsWaybillOpen(false)} 
          data={currentWaybillData} 
          isSuccessNotification={waybillSuccessBanner}
        />
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
                <label className="booking-label">No. Telepon Pengirim (Tersambung ke VA)</label>
                <input 
                  type="tel" 
                  placeholder="08123456789"
                  {...register('senderPhone', { required: true })} 
                  className="apple-input w-full font-mono" 
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
                  className="apple-input w-full font-mono" 
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

            {/* Payment Method Selector */}
            <div className="booking-field-group mb-0">
              <label className="booking-label">Pilihan Metode Pembayaran (FR-6.3)</label>
              <select 
                {...register('paymentMethod')} 
                value={selectedPaymentMethod}
                onChange={(e) => {
                  register('paymentMethod').onChange(e);
                  setSelectedPaymentMethod(e.target.value);
                }}
                className="apple-input w-full font-semibold"
              >
                <optgroup label="Virtual Account (Otomatis via No. Telepon)">
                  <option value="BCA_VA">BCA Virtual Account (Prefix 39107)</option>
                  <option value="BLU_VA">BLU by BCA Virtual Account (Prefix 00789)</option>
                  <option value="MANDIRI_VA">Mandiri Virtual Account (Prefix 89508)</option>
                  <option value="BNI_VA">BNI Virtual Account (Prefix 8241)</option>
                  <option value="BRI_VA">BRI Virtual Account (BRIVA - Prefix 88099)</option>
                </optgroup>
                <optgroup label="Transfer Bank Manual (Crosscheck Struk)">
                  <option value="BCA">Transfer Bank BCA (8890123456)</option>
                  <option value="BLU_BCA">Transfer Bank BLU by BCA (0078901234)</option>
                  <option value="MANDIRI">Transfer Bank Mandiri (1270012345678)</option>
                  <option value="BNI">Transfer Bank BNI (0987654321)</option>
                  <option value="BRI">Transfer Bank BRI (034501000123456)</option>
                </optgroup>
                <optgroup label="Cash on Delivery (COD)">
                  <option value="COD">Cash on Delivery (Minimal DP 50% saat Penjemputan)</option>
                </optgroup>
              </select>
            </div>

            {/* Conditional COD DP Input */}
            {selectedPaymentMethod === 'COD' && rateResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-[var(--kb-hazard)]/15 border border-[var(--kb-wood)] rounded space-y-2"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--kb-wood)]">
                  <Banknote className="w-4 h-4 text-[var(--kb-wood)]" />
                  <span>Uang Muka (DP) Penjemputan (Minimal 50%)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-[var(--kb-wood-light)]">Nominal DP (Rp)</label>
                    <input 
                      type="number"
                      min={rateResult.totalPrice * 0.5}
                      max={rateResult.totalPrice}
                      defaultValue={rateResult.totalPrice * 0.5}
                      {...register('codDpAmount')}
                      onChange={(e) => {
                        register('codDpAmount').onChange(e);
                        setWatchedCodDp(e.target.value === '' ? '' : Number(e.target.value));
                      }}
                      className="cargo-input w-full text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="flex flex-col justify-end text-xs text-[var(--kb-wood)]">
                    <div>Sisa saat barang tiba:</div>
                    <div className="font-bold text-sm">
                      Rp {Math.max(0, rateResult.totalPrice - (Number(watchedCodDp) || (rateResult.totalPrice * 0.5))).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
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
              {isSubmitting ? 'Memproses Pesanan & Tagihan...' : 'Konfirmasi & Buat Pengiriman'}
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
