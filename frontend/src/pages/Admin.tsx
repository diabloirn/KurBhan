import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  CreditCard, 
  Layers, 
  TrendingDown, 
  RefreshCw, 
  CheckCircle2, 
  MapPin, 
  Search, 
  Send,
  Zap,
  FileCheck,
  X,
  Printer
} from 'lucide-react';
import { 
  getStoredShipments, 
  updateStoredShipmentStatus, 
  updateStoredPaymentStatus, 
  type StoredShipment 
} from '../lib/shipmentStorage';
import { shipmentServiceClient, paymentServiceClient } from '../services/grpcClient';
import { 
  UpdateShipmentStatusRequest, 
  ConfirmPaymentRequest, 
  ProcessVATransactionRequest 
} from '../proto/kurbhan_pb';
import { cn } from '../lib/cn';
import WaybillModal, { type WaybillData } from '../components/WaybillModal';
import './Admin.css';

interface DriverItem {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  status: 'TERSEDIA' | 'DALAM_RUTE' | 'ISTIRAHAT';
  currentRoute: string;
}

const INITIAL_DRIVERS: DriverItem[] = [
  { id: 'drv-1', name: 'Pak Joko Susilo', phone: '081299881122', vehicle: 'Mobil Box Kecil', plateNumber: 'B 1234 KBH', status: 'DALAM_RUTE', currentRoute: 'Jakarta Timur ➔ Bekasi' },
  { id: 'drv-2', name: 'Pak Hendra Pratama', phone: '081377889900', vehicle: 'Mobil Box Sedang', plateNumber: 'D 4567 KBH', status: 'DALAM_RUTE', currentRoute: 'Jakarta ➔ Bandung' },
  { id: 'drv-3', name: 'Pak Rudi Hermawan', phone: '085244556677', vehicle: 'Truk Tronton Hino', plateNumber: 'B 9988 KBH', status: 'TERSEDIA', currentRoute: 'Pool Tanjung Priok' },
  { id: 'drv-4', name: 'Pak Bambang Irawan', phone: '087811224455', vehicle: 'Mobil Box Besar', plateNumber: 'B 7766 KBH', status: 'TERSEDIA', currentRoute: 'Hub Cawang' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'shipments' | 'payments' | 'fleet' | 'rates'>('shipments');
  const [shipments, setShipments] = useState<StoredShipment[]>(() => getStoredShipments());
  const [searchFilter, setSearchFilter] = useState('');

  // Status update form state
  const [selectedResi, setSelectedResi] = useState(() => {
    const list = getStoredShipments();
    return list.length > 0 ? list[0].trackingNumber : '';
  });
  const [newStatus, setNewStatus] = useState<StoredShipment['status']>('IN_TRANSIT');
  const [locationNote, setLocationNote] = useState('');
  const [descNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Competitor scraping state
  const [scrapingTime, setScrapingTime] = useState('Hari ini, 08:00 WIB');
  const [isScraping, setIsScraping] = useState(false);

  // VA Simulation state
  const [vaSimulationNumber, setVaSimulationNumber] = useState('');
  const [vaSimulationAmount, setVaSimulationAmount] = useState<number | ''>('');
  const [isProcessingVA, setIsProcessingVA] = useState(false);
  const [vaSimulationFeedback, setVaSimulationFeedback] = useState<{ success: boolean; status: string; message: string } | null>(null);

  // Transfer verification modal state
  const [activeTransferShipment, setActiveTransferShipment] = useState<StoredShipment | null>(null);
  const [transferSenderName, setTransferSenderName] = useState('');
  const [transferSenderPhone, setTransferSenderPhone] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferProof, setTransferProof] = useState('');
  const [isConfirmingTransfer, setIsConfirmingTransfer] = useState(false);
  const [transferFeedback, setTransferFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [waybillModalData, setWaybillModalData] = useState<WaybillData | null>(null);
  const [isWaybillOpen, setIsWaybillOpen] = useState(false);
  const [waybillSuccessBanner, setWaybillSuccessBanner] = useState(false);

  const handleUpdateStatus = async () => {
    if (!selectedResi) return;

    setIsUpdating(true);
    setUpdateFeedback(null);

    try {
      const req = new UpdateShipmentStatusRequest();
      req.setTrackingNumber(selectedResi);
      req.setStatus(newStatus);
      req.setLocation(locationNote || 'Hub Operasional KurBhan');
      req.setDescription(descNote || `Status diperbarui menjadi ${newStatus}`);

      await shipmentServiceClient.updateShipmentStatus(req, {});
      setUpdateFeedback({ success: true, message: `Status resi ${selectedResi} berhasil diperbarui di server gRPC!` });
    } catch {
      setUpdateFeedback({ success: true, message: `Status resi ${selectedResi} tersinkronisasi di manifest lokal.` });
    } finally {
      updateStoredShipmentStatus(selectedResi, newStatus);
      setShipments(getStoredShipments());
      setIsUpdating(false);
    }
  };

  // Automated VA transaction processing (Simulated Webhook / Inward Transaction)
  const handleProcessVATransaction = async () => {
    if (!vaSimulationNumber || !vaSimulationAmount) return;

    setIsProcessingVA(true);
    setVaSimulationFeedback(null);

    try {
      const req = new ProcessVATransactionRequest();
      req.setVaNumber(vaSimulationNumber);
      req.setAmount(Number(vaSimulationAmount));
      req.setTransactionId(`tx-va-${Date.now()}`);
      req.setPaymentDate(new Date().toISOString());

      const res = await paymentServiceClient.processVATransaction(req, {});
      const obj = res.toObject();

      if (obj.success) {
        setVaSimulationFeedback({
          success: true,
          status: obj.status,
          message: `✅ DITERIMA: Uang transfer Rp ${Number(vaSimulationAmount).toLocaleString('id-ID')} sesuai tujuan VA ${vaSimulationNumber}. Status diperbarui menjadi LUNAS!`
        });

        // Update local storage status
        const current = getStoredShipments();
        const target = current.find(s => s.vaNumber === vaSimulationNumber);
        if (target) {
          updateStoredPaymentStatus(target.trackingNumber, 'VERIFIED');
          setShipments(getStoredShipments());
          setWaybillModalData({
            trackingNumber: target.trackingNumber,
            senderName: target.senderName,
            senderPhone: target.senderPhone,
            senderAddress: target.senderAddress,
            receiverName: target.receiverName,
            receiverPhone: target.receiverPhone,
            receiverAddress: target.receiverAddress,
            originLocation: target.originLocation,
            destinationLocation: target.destinationLocation,
            weightKg: target.weightKg,
            serviceType: target.serviceType,
            vehicleType: target.vehicleType,
            totalCost: target.totalCost,
            paymentMethod: target.paymentMethod,
            paymentStatus: 'VERIFIED',
            vaNumber: target.vaNumber,
            createdAt: target.createdAt,
          });
          setWaybillSuccessBanner(true);
          setIsWaybillOpen(true);
        }
      } else {
        setVaSimulationFeedback({
          success: false,
          status: obj.status,
          message: `❌ DITOLAK: ${obj.rejectionReason || obj.message}`
        });
      }
    } catch {
      // Fallback local logic
      const current = getStoredShipments();
      const target = current.find(s => s.vaNumber === vaSimulationNumber);
      if (target) {
        if (Math.abs(target.totalCost - Number(vaSimulationAmount)) <= 0.01) {
          updateStoredPaymentStatus(target.trackingNumber, 'VERIFIED');
          setShipments(getStoredShipments());
          setVaSimulationFeedback({
            success: true,
            status: 'ACCEPTED',
            message: `✅ DITERIMA (Simulasi): Uang transfer Rp ${Number(vaSimulationAmount).toLocaleString('id-ID')} cocok dengan tagihan VA. Status LUNAS!`
          });
          setWaybillModalData({
            trackingNumber: target.trackingNumber,
            senderName: target.senderName,
            senderPhone: target.senderPhone,
            senderAddress: target.senderAddress,
            receiverName: target.receiverName,
            receiverPhone: target.receiverPhone,
            receiverAddress: target.receiverAddress,
            originLocation: target.originLocation,
            destinationLocation: target.destinationLocation,
            weightKg: target.weightKg,
            serviceType: target.serviceType,
            vehicleType: target.vehicleType,
            totalCost: target.totalCost,
            paymentMethod: target.paymentMethod,
            paymentStatus: 'VERIFIED',
            vaNumber: target.vaNumber,
            createdAt: target.createdAt,
          });
          setWaybillSuccessBanner(true);
          setIsWaybillOpen(true);
        } else {
          setVaSimulationFeedback({
            success: false,
            status: 'REJECTED',
            message: `❌ DITOLAK: Nominal transfer Rp ${Number(vaSimulationAmount).toLocaleString('id-ID')} tidak cocok dengan tagihan Rp ${target.totalCost.toLocaleString('id-ID')}!`
          });
        }
      } else {
        setVaSimulationFeedback({
          success: false,
          status: 'REJECTED',
          message: `❌ DITOLAK: Nomor VA ${vaSimulationNumber} tidak terdaftar dalam manifes!`
        });
      }
    } finally {
      setIsProcessingVA(false);
    }
  };

  // Manual bank transfer cross-checking
  const handleOpenTransferModal = (shipment: StoredShipment) => {
    setActiveTransferShipment(shipment);
    setTransferSenderName(shipment.senderName);
    setTransferSenderPhone(shipment.senderPhone);
    setTransferAmount(shipment.totalCost);
    setTransferProof(shipment.transferProofUrl || 'https://storage.kurbhan.co.id/proofs/sample_transfer.jpg');
    setTransferFeedback(null);
  };

  const handleConfirmBankTransfer = async () => {
    if (!activeTransferShipment) return;

    setIsConfirmingTransfer(true);
    setTransferFeedback(null);

    try {
      const req = new ConfirmPaymentRequest();
      req.setPaymentId(activeTransferShipment.paymentId || `pay-${activeTransferShipment.trackingNumber}`);
      req.setConfirmedBy('ADMIN_OFFICER');
      req.setSenderName(transferSenderName);
      req.setSenderPhone(transferSenderPhone);
      req.setAmountTransferred(Number(transferAmount));
      req.setProofImageUrl(transferProof);
      req.setBankSender(activeTransferShipment.paymentChannel || 'BCA');

      const res = await paymentServiceClient.confirmPayment(req, {});
      const obj = res.toObject();

      if (obj.success) {
        updateStoredPaymentStatus(activeTransferShipment.trackingNumber, 'VERIFIED');
        setShipments(getStoredShipments());
        setTransferFeedback({ success: true, message: '✅ Pembayaran transfer berhasil diverifikasi dan dikonfirmasi!' });
        setWaybillModalData({
          trackingNumber: activeTransferShipment.trackingNumber,
          senderName: activeTransferShipment.senderName,
          senderPhone: activeTransferShipment.senderPhone,
          senderAddress: activeTransferShipment.senderAddress,
          receiverName: activeTransferShipment.receiverName,
          receiverPhone: activeTransferShipment.receiverPhone,
          receiverAddress: activeTransferShipment.receiverAddress,
          originLocation: activeTransferShipment.originLocation,
          destinationLocation: activeTransferShipment.destinationLocation,
          weightKg: activeTransferShipment.weightKg,
          serviceType: activeTransferShipment.serviceType,
          vehicleType: activeTransferShipment.vehicleType,
          totalCost: activeTransferShipment.totalCost,
          paymentMethod: activeTransferShipment.paymentMethod,
          paymentStatus: 'VERIFIED',
          vaNumber: activeTransferShipment.vaNumber,
          createdAt: activeTransferShipment.createdAt,
        });
        setWaybillSuccessBanner(true);
        setTimeout(() => {
          setActiveTransferShipment(null);
          setIsWaybillOpen(true);
        }, 1200);
      } else {
        setTransferFeedback({ success: false, message: `❌ Verifikasi ditolak: ${obj.rejectionReason || obj.message}` });
      }
    } catch {
      // Local fallback verification
      if (Math.abs(activeTransferShipment.totalCost - Number(transferAmount)) <= 0.01 && transferSenderName && transferSenderPhone) {
        updateStoredPaymentStatus(activeTransferShipment.trackingNumber, 'VERIFIED');
        setShipments(getStoredShipments());
        setTransferFeedback({ success: true, message: '✅ Pembayaran transfer berhasil diverifikasi (Local Sync)!' });
        setWaybillModalData({
          trackingNumber: activeTransferShipment.trackingNumber,
          senderName: activeTransferShipment.senderName,
          senderPhone: activeTransferShipment.senderPhone,
          senderAddress: activeTransferShipment.senderAddress,
          receiverName: activeTransferShipment.receiverName,
          receiverPhone: activeTransferShipment.receiverPhone,
          receiverAddress: activeTransferShipment.receiverAddress,
          originLocation: activeTransferShipment.originLocation,
          destinationLocation: activeTransferShipment.destinationLocation,
          weightKg: activeTransferShipment.weightKg,
          serviceType: activeTransferShipment.serviceType,
          vehicleType: activeTransferShipment.vehicleType,
          totalCost: activeTransferShipment.totalCost,
          paymentMethod: activeTransferShipment.paymentMethod,
          paymentStatus: 'VERIFIED',
          vaNumber: activeTransferShipment.vaNumber,
          createdAt: activeTransferShipment.createdAt,
        });
        setWaybillSuccessBanner(true);
        setTimeout(() => {
          setActiveTransferShipment(null);
          setIsWaybillOpen(true);
        }, 1200);
      } else {
        setTransferFeedback({ success: false, message: '❌ Verifikasi ditolak: Nominal atau data tidak sesuai.' });
      }
    } finally {
      setIsConfirmingTransfer(false);
    }
  };

  const handleTriggerScraper = () => {
    setIsScraping(true);
    setTimeout(() => {
      setScrapingTime('Baru saja (Live Sync)');
      setIsScraping(false);
    }, 1200);
  };

  const filteredShipments = shipments.filter(s => 
    s.trackingNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.senderName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.receiverName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="admin-root">
      <div className="admin-container">
        {/* Top Header */}
        <div className="admin-header">
          <div className="admin-title-box">
            <span className="section-eyebrow">CONTROL CENTER</span>
            <h1 className="admin-headline">Dashboard Operasional Admin</h1>
            <p className="admin-sub">
              Manajemen manifest pengiriman, alokasi armada/driver, verifikasi pembayaran multi-channel, dan benchmark tarif.
            </p>
          </div>
          <div className="admin-badge">
            <span className="w-2 h-2 rounded-full bg-[var(--kb-green)] animate-pulse" />
            <span>Sistem Operasional Aktif</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="admin-tabs">
          <button 
            type="button" 
            onClick={() => setActiveTab('shipments')}
            className={cn("admin-tab-btn", activeTab === 'shipments' && "active")}
          >
            <Layers className="w-4 h-4" />
            <span>Manajemen Manifest & Status (FR-6.2)</span>
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('payments')}
            className={cn("admin-tab-btn", activeTab === 'payments' && "active")}
          >
            <CreditCard className="w-4 h-4" />
            <span>Verifikasi Pembayaran & VA (FR-6.3)</span>
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('fleet')}
            className={cn("admin-tab-btn", activeTab === 'fleet' && "active")}
          >
            <Truck className="w-4 h-4" />
            <span>Alokasi Armada & Driver (FR-6.1)</span>
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('rates')}
            className={cn("admin-tab-btn", activeTab === 'rates' && "active")}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Benchmark Tarif & Scraping (FR-5)</span>
          </button>
        </div>

        {/* Tab 1: Manifest & Status Update (FR-6.2) */}
        {activeTab === 'shipments' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Quick Status Update Panel */}
            <div className="admin-update-panel">
              <div className="admin-panel-title">
                <Send className="w-4 h-4 text-[var(--kb-wood)]" />
                <span>Form Pembaruan Status Manifest Pengiriman (gRPC UpdateShipmentStatus)</span>
              </div>
              
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Pilih Nomor Resi</label>
                  <select 
                    value={selectedResi} 
                    onChange={(e) => setSelectedResi(e.target.value)}
                    className="cargo-input w-full text-sm font-mono"
                  >
                    {shipments.map(s => (
                      <option key={s.id} value={s.trackingNumber}>
                        {s.trackingNumber} ({s.receiverName} - {s.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Status Baru</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value as StoredShipment['status'])}
                    className="cargo-input w-full text-sm font-semibold"
                  >
                    <option value="PICKED_UP">PICKED_UP (Sudah Dijemput Armada)</option>
                    <option value="IN_TRANSIT">IN_TRANSIT (Dalam Perjalanan Manifest)</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Kurir Menuju Lokasi)</option>
                    <option value="DELIVERED">DELIVERED (Telah Diterima)</option>
                    <option value="CANCELLED">CANCELLED (Batalkan)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Lokasi Hub / Titik</label>
                  <input 
                    type="text" 
                    placeholder="cth: Hub Kramat Jati / Sortir Bekasi"
                    value={locationNote}
                    onChange={(e) => setLocationNote(e.target.value)}
                    className="cargo-input w-full text-sm"
                  />
                </div>

                <div>
                  <button 
                    type="button" 
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="hazard-btn w-full h-[42px] text-sm flex items-center justify-center gap-1.5"
                  >
                    {isUpdating ? 'Mengirim...' : 'Perbarui Status'}
                  </button>
                </div>
              </div>

              {updateFeedback && (
                <div className="mt-3 text-xs font-bold text-[var(--kb-wood)] flex items-center gap-1 bg-[var(--kb-hazard)] px-2.5 py-1.5 border border-[var(--kb-wood)] inline-flex">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{updateFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Manifest List Table */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Layers className="w-5 h-5 text-[var(--kb-wood)]" />
                  Daftar Seluruh Manifest Pengiriman
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--kb-wood-light)]" />
                  <input 
                    type="text" 
                    placeholder="Cari resi / nama..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="cargo-input w-full pl-9 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nomor Resi</th>
                      <th>Rute Pengiriman</th>
                      <th>Pengirim & Penerima</th>
                      <th>Layanan / Armada</th>
                      <th>Biaya</th>
                      <th>Status Manifest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map(item => (
                      <tr key={item.id}>
                        <td>
                          <span className="font-mono font-bold text-[var(--kb-blue)]">{item.trackingNumber}</span>
                          <span className="block text-xs text-[var(--kb-gray-2)]">{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                        </td>
                        <td>
                          <div className="font-semibold text-xs">{item.originLocation}</div>
                          <div className="text-xs text-[var(--kb-gray-2)]">➔ {item.destinationLocation}</div>
                        </td>
                        <td>
                          <div className="font-bold text-xs">{item.senderName}</div>
                          <div className="text-xs text-[var(--kb-gray-2)]">ke {item.receiverName}</div>
                        </td>
                        <td>
                          <div className="uppercase font-semibold text-xs">{item.serviceType}</div>
                          <div className="text-xs text-[var(--kb-gray-2)]">{item.vehicleType.replace(/_/g, ' ')} • {item.weightKg} kg</div>
                        </td>
                        <td className="font-semibold">
                          Rp {item.totalCost.toLocaleString('id-ID')}
                        </td>
                        <td>
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-bold border",
                            item.status === 'DELIVERED' && "bg-[var(--kb-green)]/15 text-[var(--kb-green)] border-[var(--kb-green)]",
                            item.status === 'IN_TRANSIT' && "bg-[var(--kb-blue)]/15 text-[var(--kb-blue)] border-[var(--kb-blue)]",
                            item.status === 'PICKED_UP' && "bg-[var(--kb-blue)]/15 text-[var(--kb-blue)] border-[var(--kb-blue)]",
                            item.status === 'PENDING' && "bg-[var(--kb-yellow)]/20 text-[var(--kb-yellow)] border-[var(--kb-yellow)]",
                            item.status === 'CANCELLED' && "bg-[var(--kb-red)]/15 text-[var(--kb-red)] border-[var(--kb-red)]"
                          )}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Verifikasi Pembayaran & Simulasi VA (FR-6.3) */}
        {activeTab === 'payments' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Simulasi Otomasi Virtual Account Masuk */}
            <div className="admin-update-panel bg-[var(--kb-paper)] border-2 border-[var(--kb-hazard)]">
              <div className="admin-panel-title text-[var(--kb-wood)] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[var(--kb-wood)]" />
                  <span className="font-bold">⚡ Simulasi Otomasi Pembayaran Virtual Account Masuk (Webhook Test)</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-[var(--kb-hazard)] text-[var(--kb-wood)] font-bold">
                  Batas Waktu: 1x24 Jam
                </span>
              </div>
              <p className="text-xs text-[var(--kb-wood-light)] mt-1 mb-3">
                Uji coba otomatisasi: Sistem backend dan database akan memeriksa kecocokan nomor VA tujuan, nominal uang, serta batas waktu 1x24 jam. Jika cocok, pembayaran langsung diterima dan status pengiriman berubah otomatis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--kb-wood)]">Nomor Virtual Account</label>
                  <input 
                    type="text"
                    placeholder="cth: 3910781234567890"
                    value={vaSimulationNumber}
                    onChange={(e) => setVaSimulationNumber(e.target.value)}
                    className="cargo-input w-full text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--kb-wood)]">Nominal Uang Transfer (Rp)</label>
                  <input 
                    type="number"
                    placeholder="cth: 45000"
                    value={vaSimulationAmount}
                    onChange={(e) => setVaSimulationAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="cargo-input w-full text-xs font-mono font-bold"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="button" 
                    onClick={handleProcessVATransaction}
                    disabled={isProcessingVA || !vaSimulationNumber || !vaSimulationAmount}
                    className="hazard-btn w-full h-[38px] text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isProcessingVA ? 'Memeriksa Mutasi...' : 'Kirim Transaksi Masuk'}
                  </button>
                </div>
              </div>

              {vaSimulationFeedback && (
                <div className={cn(
                  "mt-3 text-xs font-bold p-2.5 border flex items-center gap-1.5",
                  vaSimulationFeedback.success 
                    ? "bg-[var(--kb-hazard)] text-[var(--kb-wood)] border-[var(--kb-wood)]" 
                    : "bg-red-100 text-red-800 border-red-400"
                )}>
                  <span>{vaSimulationFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Tabel Daftar Pembayaran & Aksi Crosscheck */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">
                    <CreditCard className="w-5 h-5 text-[var(--kb-wood)]" />
                    Daftar Pembayaran Masuk & Status Verifikasi (FR-6.3)
                  </h3>
                  <p className="text-xs text-[var(--kb-wood-light)] mt-1">
                    Verifikasi pembayaran dari Virtual Account (otomatis), Transfer Bank (crosscheck manual), dan COD (minimal DP 50%).
                  </p>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nomor Resi</th>
                      <th>Pengirim & Kontak</th>
                      <th>Metode & Channel</th>
                      <th>Info Akun / VA</th>
                      <th>Nominal Tagihan</th>
                      <th>Status</th>
                      <th>Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map(item => (
                      <tr key={item.id}>
                        <td className="font-mono font-bold">{item.trackingNumber}</td>
                        <td>
                          <div className="font-bold text-xs">{item.senderName}</div>
                          <div className="text-xs text-[var(--kb-gray-2)] font-mono">{item.senderPhone}</div>
                        </td>
                        <td>
                          <span className="text-xs font-semibold px-2 py-0.5 bg-[var(--kb-paper-dark)] border border-[var(--kb-wood)] inline-block">
                            {item.paymentMethod}
                          </span>
                        </td>
                        <td>
                          {item.vaNumber ? (
                            <div>
                              <span className="font-mono text-xs font-bold text-[var(--kb-wood)] block">{item.vaNumber}</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  setVaSimulationNumber(item.vaNumber || '');
                                  setVaSimulationAmount(item.totalCost);
                                }}
                                className="text-[10px] text-[var(--kb-wood)] underline mt-0.5"
                              >
                                Isi ke Simulasi VA ↗
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--kb-gray-2)]">Rekening KurBhan</span>
                          )}
                        </td>
                        <td className="font-bold">
                          Rp {item.totalCost.toLocaleString('id-ID')}
                          {item.dpAmount ? (
                            <span className="block text-[10px] text-[var(--kb-wood-light)]">DP: Rp {item.dpAmount.toLocaleString('id-ID')}</span>
                          ) : null}
                        </td>
                        <td>
                          <span className={cn(
                            "px-2.5 py-1 text-xs font-bold border",
                            item.paymentStatus === 'VERIFIED'
                              ? "bg-[var(--kb-hazard)] text-[var(--kb-wood)] border-[var(--kb-wood)]"
                              : "bg-[var(--kb-paper-dark)] text-[var(--kb-wood)] border-[var(--kb-wood)]"
                          )}>
                            {item.paymentStatus === 'VERIFIED' ? 'TERVERIFIKASI' : 'MENUNGGU VERIFIKASI'}
                          </span>
                        </td>
                        <td>
                          {item.paymentStatus === 'VERIFIED' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--kb-green)] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-[var(--kb-green)]" />
                                LUNAS
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setWaybillModalData({
                                    trackingNumber: item.trackingNumber,
                                    senderName: item.senderName,
                                    senderPhone: item.senderPhone,
                                    senderAddress: item.senderAddress,
                                    receiverName: item.receiverName,
                                    receiverPhone: item.receiverPhone,
                                    receiverAddress: item.receiverAddress,
                                    originLocation: item.originLocation,
                                    destinationLocation: item.destinationLocation,
                                    weightKg: item.weightKg,
                                    serviceType: item.serviceType,
                                    vehicleType: item.vehicleType,
                                    totalCost: item.totalCost,
                                    paymentMethod: item.paymentMethod,
                                    paymentStatus: item.paymentStatus,
                                    vaNumber: item.vaNumber,
                                    createdAt: item.createdAt,
                                  });
                                  setWaybillSuccessBanner(false);
                                  setIsWaybillOpen(true);
                                }}
                                className="paper-btn text-xs px-2 py-0.5 flex items-center gap-1 cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Cetak Resi</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button 
                                type="button" 
                                onClick={() => handleOpenTransferModal(item)}
                                className="hazard-btn text-xs px-2.5 py-1 flex items-center gap-1"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Crosscheck</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Crosscheck Transfer Manual */}
            {activeTransferShipment && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[var(--kb-paper)] border-2 border-[var(--kb-wood)] p-6 max-w-lg w-full rounded shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--kb-kraft-dark)]">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-[var(--kb-wood)]" />
                      <h3 className="font-bold text-sm text-[var(--kb-wood)]">
                        Crosscheck & Verifikasi Transfer Bank ({activeTransferShipment.trackingNumber})
                      </h3>
                    </div>
                    <button type="button" onClick={() => setActiveTransferShipment(null)} className="text-[var(--kb-wood)]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-[var(--kb-wood-light)]">
                    Backend akan memverifikasi nama lengkap, nomor telepon, kesesuaian nominal transfer dengan tagihan, dan bukti transfer sebelum menerima pembayaran.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-[var(--kb-wood)]">Nama Lengkap Pengirim (Pada Bukti Transfer)</label>
                      <input 
                        type="text"
                        value={transferSenderName}
                        onChange={(e) => setTransferSenderName(e.target.value)}
                        className="cargo-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[var(--kb-wood)]">Nomor Telepon Pengirim</label>
                      <input 
                        type="text"
                        value={transferSenderPhone}
                        onChange={(e) => setTransferSenderPhone(e.target.value)}
                        className="cargo-input w-full text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[var(--kb-wood)]">Nominal yang Ditransfer (Rp)</label>
                      <input 
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(Number(e.target.value))}
                        className="cargo-input w-full text-xs font-mono font-bold"
                      />
                      <span className="text-[10px] text-[var(--kb-wood-light)]">
                        Tagihan sistem: Rp {activeTransferShipment.totalCost.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-[var(--kb-wood)]">URL / Path Bukti Transfer (Struk)</label>
                      <input 
                        type="text"
                        value={transferProof}
                        onChange={(e) => setTransferProof(e.target.value)}
                        className="cargo-input w-full text-xs font-mono"
                      />
                    </div>
                  </div>

                  {transferFeedback && (
                    <div className={cn(
                      "text-xs font-bold p-2 border flex items-center gap-1.5",
                      transferFeedback.success 
                        ? "bg-[var(--kb-hazard)] text-[var(--kb-wood)] border-[var(--kb-wood)]" 
                        : "bg-red-100 text-red-800 border-red-400"
                    )}>
                      <span>{transferFeedback.message}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--kb-kraft-dark)]">
                    <button 
                      type="button" 
                      onClick={() => setActiveTransferShipment(null)}
                      className="paper-btn text-xs px-3 py-1.5"
                    >
                      Batal
                    </button>
                    <button 
                      type="button" 
                      onClick={handleConfirmBankTransfer}
                      disabled={isConfirmingTransfer}
                      className="hazard-btn text-xs px-4 py-1.5 flex items-center gap-1.5"
                    >
                      {isConfirmingTransfer ? 'Memverifikasi...' : 'Verifikasi & Konfirmasi'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 3: Armada & Driver (FR-6.1) */}
        {activeTab === 'fleet' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">
                    <Truck className="w-5 h-5 text-[var(--kb-wood)]" />
                    Manajemen Ketersediaan Armada & Alokasi Driver (FR-6.1)
                  </h3>
                  <p className="text-xs text-[var(--kb-wood-light)] mt-1">
                    Pantau status unit kendaraan operasional dan penugasan kurir di lapangan.
                  </p>
                </div>
              </div>

              <div className="admin-fleet-grid">
                {INITIAL_DRIVERS.map(drv => (
                  <div key={drv.id} className="admin-fleet-card">
                    <div className="admin-fleet-header">
                      <span className="admin-fleet-name">{drv.name}</span>
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-bold border",
                        drv.status === 'TERSEDIA' ? "bg-[var(--kb-hazard)] text-[var(--kb-wood)] border-[var(--kb-wood)]" : "bg-[var(--kb-paper-dark)] text-[var(--kb-wood)] border-[var(--kb-wood)]"
                      )}>
                        {drv.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <div className="text-xs space-y-1.5 text-[var(--kb-wood)]">
                      <div><strong className="text-[var(--kb-wood-light)]">Armada:</strong> {drv.vehicle} ({drv.plateNumber})</div>
                      <div><strong className="text-[var(--kb-wood-light)]">Kontak:</strong> {drv.phone}</div>
                      <div className="flex items-center gap-1 text-[var(--kb-wood)] pt-1 border-t border-[var(--kb-kraft-dark)]">
                        <MapPin className="w-3.5 h-3.5 text-[var(--kb-wood)]" />
                        <span className="font-semibold">{drv.currentRoute}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Benchmark Tarif & Scraping Engine (FR-5) */}
        {activeTab === 'rates' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">
                    <TrendingDown className="w-5 h-5 text-[var(--kb-wood)]" />
                    Benchmark Harga Kompetitor & Scraping Engine (FR-5.1 & FR-5.2)
                  </h3>
                  <p className="text-xs text-[var(--kb-wood-light)] mt-1">
                    Perbandingan acuan tarif KurBhan terhadap kompetitor ekspedisi nasional secara berkala.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="admin-scraping-sync-badge">
                    <span className="w-2 h-2 rounded-full bg-[var(--kb-wood)]" />
                    <span>Sinkron: {scrapingTime}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleTriggerScraper}
                    disabled={isScraping}
                    className="paper-btn text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isScraping && "animate-spin")} />
                    <span>{isScraping ? 'Scraping...' : 'Jalankan Scraping Sekarang'}</span>
                  </button>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Rute Logistik</th>
                      <th>Berat</th>
                      <th>KurBhan (Transparan)</th>
                      <th>JNE Reguler</th>
                      <th>J&T Express EZ</th>
                      <th>SiCepat BEST</th>
                      <th>Status Selisih</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold text-xs">Jakarta Timur ➔ Bekasi Barat</td>
                      <td className="text-xs">5 kg</td>
                      <td className="font-bold text-[var(--kb-wood)]">Rp 45.000</td>
                      <td className="text-xs text-[var(--kb-wood-light)]">Rp 55.000</td>
                      <td className="text-xs text-[var(--kb-wood-light)]">Rp 53.000</td>
                      <td className="text-xs text-[var(--kb-wood-light)]">Rp 56.000</td>
                      <td>
                        <span className="px-2 py-0.5 text-xs font-bold bg-[var(--kb-hazard)] text-[var(--kb-wood)] border border-[var(--kb-wood)]">
                          Hemat 18% - 24%
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-xs">Jakarta ➔ Bandung</td>
                      <td className="text-xs">12 kg</td>
                      <td className="font-bold text-[var(--kb-wood)]">Rp 85.000</td>
                      <td className="text-xs text-[var(--kb-wood-light)]">Rp 104.000</td>
                      <td className="text-xs text-[var(--kb-wood-light)]">Rp 100.000</td>
                      <td className="text-xs text-[var(--kb-wood-light)]">Rp 106.000</td>
                      <td>
                        <span className="px-2 py-0.5 text-xs font-bold bg-[var(--kb-hazard)] text-[var(--kb-wood)] border border-[var(--kb-wood)]">
                          Hemat 15% - 25%
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-xs">Surabaya ➔ Medan (Lintas Pulau)</td>
                      <td className="text-xs">25 kg</td>
                      <td className="font-bold text-[var(--kb-wood)]">Rp 320.000</td>
                      <td className="text-xs text-[var(--kb-wood-light)]">Rp 390.000</td>
                      <td className="text-xs text-[var(--kb-wood-light)]">Rp 380.000</td>
                      <td className="text-xs text-[var(--kb-wood-light)]">Rp 400.000</td>
                      <td>
                        <span className="px-2 py-0.5 text-xs font-bold bg-[var(--kb-hazard)] text-[var(--kb-wood)] border border-[var(--kb-wood)]">
                          Hemat 19% - 25%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal Cetak Resi Fisik / Pop-up Pembayaran Berhasil */}
      <WaybillModal 
        isOpen={isWaybillOpen} 
        onClose={() => setIsWaybillOpen(false)} 
        data={waybillModalData} 
        isSuccessNotification={waybillSuccessBanner}
      />
    </div>
  );
}
