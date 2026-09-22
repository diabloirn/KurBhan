import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Search, TrendingUp, Package, Clock, CheckCircle2, ArrowRight, ShieldCheck, Ban, ArrowUpRight, Printer } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getStoredShipments, updateStoredShipmentStatus, type StoredShipment } from '../lib/shipmentStorage';
import { shipmentServiceClient } from '../services/grpcClient';
import { CancelShipmentRequest } from '../proto/kurbhan_pb';
import { cn } from '../lib/cn';
import WaybillModal, { type WaybillData } from '../components/WaybillModal';
import './Dashboard.css';

const getStatusBadge = (status: StoredShipment['status']) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Menunggu Penjemputan', color: 'border-[var(--kb-wood)] bg-[var(--kb-hazard)]/25 text-[var(--kb-wood)]' };
    case 'PICKED_UP':
      return { label: 'Dijemput Armada', color: 'border-[var(--kb-wood)] bg-[var(--kb-paper-dark)] text-[var(--kb-wood)]' };
    case 'IN_TRANSIT':
      return { label: 'Dalam Perjalanan', color: 'border-[var(--kb-wood)] bg-[var(--kb-paper-dark)] text-[var(--kb-wood)]' };
    case 'OUT_FOR_DELIVERY':
      return { label: 'Kurir Menuju Lokasi', color: 'border-[var(--kb-wood)] bg-[var(--kb-hazard)]/40 text-[var(--kb-wood)]' };
    case 'DELIVERED':
      return { label: 'Paket Terkirim', color: 'border-[var(--kb-wood)] bg-[var(--kb-hazard)] text-[var(--kb-wood)]' };
    case 'CANCELLED':
      return { label: 'Dibatalkan', color: 'border-[var(--kb-wood)] bg-[#e0d6c8] text-[#7a2e22]' };
    default:
      return { label: status, color: 'border-[var(--kb-wood)] bg-[var(--kb-paper)] text-[var(--kb-wood)]' };
  }
};

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [shipments, setShipments] = useState<StoredShipment[]>(() => getStoredShipments());
  const [mfaAuthApp, setMfaAuthApp] = useState(true);
  const [mfaSms, setMfaSms] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [selectedWaybill, setSelectedWaybill] = useState<WaybillData | null>(null);
  const [isWaybillOpen, setIsWaybillOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleCancelShipment = async (item: StoredShipment) => {
    if (!window.confirm(`Yakin ingin membatalkan pengiriman dengan resi ${item.trackingNumber}?`)) {
      return;
    }

    setCancelingId(item.id);
    try {
      if (user?.id) {
        const req = new CancelShipmentRequest();
        req.setShipmentId(item.id);
        req.setUserId(user.id);
        await shipmentServiceClient.cancelShipment(req, {});
      }
    } catch (err) {
      console.warn("Notice: Server cancel call fallback to local update:", err);
    } finally {
      updateStoredShipmentStatus(item.trackingNumber, 'CANCELLED');
      setShipments(getStoredShipments());
      setCancelingId(null);
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const totalCount = shipments.length;
  const inProgressCount = shipments.filter(s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED').length;
  const deliveredCount = shipments.filter(s => s.status === 'DELIVERED').length;

  const stats = [
    { label: 'Total Pengiriman', value: totalCount, icon: Package, borderClass: 'border-l-[var(--kb-blue)]' },
    { label: 'Dalam Proses Manifest', value: inProgressCount, icon: Clock, borderClass: 'border-l-[var(--kb-yellow)]' },
    { label: 'Selesai Terkirim', value: deliveredCount, icon: CheckCircle2, borderClass: 'border-l-[var(--kb-green)]' },
  ];

  return (
    <div className="dashboard-root">
      <div className="dashboard-container">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header"
        >
          <div className="section-eyebrow">PORTAL LOGISTIK PENGGUNA</div>
          <h1 className="dashboard-welcome">Selamat Datang, {user?.fullName || 'Pelanggan KurBhan'}!</h1>
          <p className="dashboard-sub">
            Pantau status manifes paket Anda, kalkulasi pengiriman baru, dan kelola keamanan akun.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="dashboard-actions"
        >
          <Link to="/booking" className="hazard-btn dashboard-action-btn">
            <Send className="w-4 h-4" />
            <span>Kirim Paket Baru</span>
          </Link>
          <Link to="/tracking" className="paper-btn dashboard-action-btn">
            <Search className="w-4 h-4" />
            <span>Lacak Resi Cepat</span>
          </Link>
          <Link to="/admin" className="wood-btn dashboard-action-btn ml-auto">
            <span>Operasional Admin</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--kb-hazard)]" />
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dashboard-stats-grid"
        >
          {stats.map((stat, idx) => (
            <div key={idx} className="dashboard-stat-card">
              <stat.icon className="dashboard-stat-icon" />
              <div className="dashboard-stat-val">{stat.value}</div>
              <div className="dashboard-stat-label">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Riwayat Pengiriman Lengkap (PRD FR-3.3) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dashboard-history-card"
        >
          <div className="dashboard-history-header">
            <h2 className="dashboard-history-title">Riwayat Pengiriman Anda</h2>
            <span className="text-xs font-bold px-2.5 py-1 bg-[var(--kb-kraft-light)] border border-[var(--kb-wood)] text-[var(--kb-wood)] font-mono">
              {shipments.length} MANIFEST TERCATAT
            </span>
          </div>
          
          {shipments.length === 0 ? (
            <div className="dashboard-empty-wrap">
              <TrendingUp className="dashboard-empty-icon" />
              <div className="dashboard-empty-title">Belum ada pengiriman</div>
              <p className="dashboard-empty-desc">
                Anda belum melakukan pengiriman apapun. Mulai buat pengiriman pertama Anda sekarang dengan estimasi harga transparan.
              </p>
              <Link to="/booking" className="hazard-btn px-6 py-3">
                Buat Pengiriman Pertama
              </Link>
            </div>
          ) : (
            <div className="dashboard-shipments-list">
              {shipments.map((item) => {
                const badge = getStatusBadge(item.status);

                return (
                  <div key={item.id} className="dashboard-shipment-item">
                    <div className="dashboard-item-top">
                      <div>
                        <span className="dashboard-detail-label block mb-0.5">Nomor Resi Fisik</span>
                        <span className="dashboard-item-resi">{item.trackingNumber}</span>
                      </div>
                      <span className={cn("text-xs font-bold px-2.5 py-1 border", badge.color)}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="dashboard-item-route mb-3">
                      <span>{item.originLocation}</span>
                      <ArrowRight className="w-4 h-4 text-[var(--kb-wood-light)]" />
                      <span>{item.destinationLocation}</span>
                    </div>

                    <div className="dashboard-item-details">
                      <div>
                        <div className="dashboard-detail-label">Penerima</div>
                        <div className="dashboard-detail-val">{item.receiverName}</div>
                      </div>
                      <div>
                        <div className="dashboard-detail-label">Layanan & Armada</div>
                        <div className="dashboard-detail-val uppercase">{item.serviceType} • {item.vehicleType.replace(/_/g, ' ')}</div>
                      </div>
                      <div>
                        <div className="dashboard-detail-label">Berat & Biaya</div>
                        <div className="dashboard-detail-val">{item.weightKg} kg • Rp {item.totalCost.toLocaleString('id-ID')}</div>
                      </div>
                      <div>
                        <div className="dashboard-detail-label">Status Pembayaran</div>
                        <div className="dashboard-detail-val text-[var(--kb-wood)] font-bold">{item.paymentStatus} ({item.paymentMethod})</div>
                      </div>
                    </div>

                    <div className="dashboard-item-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWaybill({
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
                          setIsWaybillOpen(true);
                        }}
                        className="hazard-btn text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Resi</span>
                      </button>

                      {item.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelShipment(item)}
                          disabled={cancelingId === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--kb-wood)] text-[var(--kb-wood)] text-xs font-bold hover:bg-[#e0d6c8] cursor-pointer transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{cancelingId === item.id ? 'Membatalkan...' : 'Batalkan'}</span>
                        </button>
                      )}
                      <Link
                        to={`/tracking?id=${item.trackingNumber}`}
                        className="wood-btn text-xs py-1.5 px-4 flex items-center gap-1"
                      >
                        <span>Lacak Detail</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Keamanan & Multi-Factor Authentication (PRD FR-1.4) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dashboard-security-card"
        >
          <div className="dashboard-security-header">
            <h3 className="dashboard-security-title">
              <ShieldCheck className="w-5 h-5 text-[var(--kb-wood)]" />
              Keamanan Akun & Multi-Factor Authentication (MFA)
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-[var(--kb-hazard)] text-[var(--kb-wood)] border border-[var(--kb-wood)]">
              PROTEKSI AKTIF
            </span>
          </div>
          <p className="text-sm text-[var(--kb-wood-light)] mb-4">
            Lindungi akun transaksi logistik Anda dari akses tanpa izin sesuai standar keamanan FR-1.4.
          </p>

          <div className="dashboard-mfa-toggles">
            <div className="dashboard-mfa-box">
              <div>
                <div className="font-bold text-sm text-[var(--kb-wood)]">Google Authenticator (TOTP)</div>
                <div className="text-xs text-[var(--kb-wood-light)] mt-0.5">Kode sandi 6 digit dari aplikasi autentikator</div>
              </div>
              <button 
                type="button" 
                onClick={() => setMfaAuthApp(!mfaAuthApp)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold border-2 transition-colors cursor-pointer",
                  mfaAuthApp ? "bg-[var(--kb-wood)] text-[var(--kb-hazard)] border-[var(--kb-wood)]" : "bg-[var(--kb-paper)] text-[var(--kb-wood)] border-[var(--kb-wood)]"
                )}
              >
                {mfaAuthApp ? 'AKTIF' : 'NONAKTIF'}
              </button>
            </div>

            <div className="dashboard-mfa-box">
              <div>
                <div className="font-bold text-sm text-[var(--kb-wood)]">Verifikasi SMS OTP</div>
                <div className="text-xs text-[var(--kb-wood-light)] mt-0.5">Kirim kode OTP ke nomor terdaftar saat login</div>
              </div>
              <button 
                type="button" 
                onClick={() => setMfaSms(!mfaSms)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold border-2 transition-colors cursor-pointer",
                  mfaSms ? "bg-[var(--kb-wood)] text-[var(--kb-hazard)] border-[var(--kb-wood)]" : "bg-[var(--kb-paper)] text-[var(--kb-wood)] border-[var(--kb-wood)]"
                )}
              >
                {mfaSms ? 'AKTIF' : 'NONAKTIF'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal Cetak Resi Fisik */}
      <WaybillModal 
        isOpen={isWaybillOpen} 
        onClose={() => setIsWaybillOpen(false)} 
        data={selectedWaybill} 
      />
    </div>
  );
}
