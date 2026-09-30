import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, MapPin, Package, CheckCircle2, DollarSign,
  RefreshCw, Navigation, Camera, ClipboardCheck,
  AlertTriangle, X, Inbox
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { shipmentServiceClient } from '../services/grpcClient';
import {
  GetDriverShipmentsRequest,
  AcceptJobRequest,
  UpdateLocationRequest,
  CompleteDeliveryRequest,
  CollectCODRequest,
} from '../proto/kurbhan_pb';
import type { DriverShipmentItem } from '../proto/kurbhan_pb';
import { cn } from '../lib/cn';
import './Driver.css';

/* ─── Timeout helper ─── */
const GRPC_TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: Promise<T>, ms = GRPC_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout — server tidak merespons')), ms)
    ),
  ]);
}

/* ─── Toast types ─── */
interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

/* ─── Status badge helper ─── */
function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return { label: 'Menunggu Driver', color: 'border-[var(--kb-wood)] bg-[var(--kb-hazard)]/25 text-[var(--kb-wood)]' };
    case 'PICKED_UP':
      return { label: 'Dijemput', color: 'border-[var(--kb-wood)] bg-[var(--kb-hazard)]/40 text-[var(--kb-wood)]' };
    case 'IN_TRANSIT':
      return { label: 'Dalam Perjalanan', color: 'border-[var(--kb-wood)] bg-[var(--kb-paper-dark)] text-[var(--kb-wood)]' };
    case 'OUT_FOR_DELIVERY':
      return { label: 'Sedang Diantar', color: 'border-[var(--kb-wood)] bg-[var(--kb-hazard)] text-[var(--kb-wood)]' };
    case 'DELIVERED':
      return { label: 'Terkirim', color: 'border-[var(--kb-wood)] bg-[var(--kb-hazard)] text-[var(--kb-wood)]' };
    default:
      return { label: status, color: 'border-[var(--kb-wood)] bg-[var(--kb-paper)] text-[var(--kb-wood)]' };
  }
}

/* ─── Format Rupiah ─── */
function fmtRp(v: number): string {
  return 'Rp ' + v.toLocaleString('id-ID');
}

/* ═════════════════════════════════════════════════════════════════════════ */

type StatusFilter = '' | 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

interface CompleteForm {
  recipientName: string;
  proofFile: File | null;
  proofPreview: string;
  notes: string;
}

interface CODForm {
  amount: string;
  collectionType: 'DP_PICKUP' | 'REMAINING_DELIVERY';
}

export default function Driver() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  /* ── Shipment state ── */
  const [jobs, setJobs] = useState<DriverShipmentItem.AsObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('');
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  /* ── GPS state ── */
  const [gpsActive, setGpsActive] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeGpsShipmentId, setActiveGpsShipmentId] = useState<string | null>(null);

  /* ── Modal state ── */
  const [completeModal, setCompleteModal] = useState<{ shipmentId: string; driverId: string } | null>(null);
  const [completeForm, setCompleteForm] = useState<CompleteForm>({ recipientName: '', proofFile: null, proofPreview: '', notes: '' });
  const [codModal, setCodModal] = useState<{ shipmentId: string; driverId: string; codAmount: number } | null>(null);
  const [codForm, setCodForm] = useState<CODForm>({ amount: '', collectionType: 'DP_PICKUP' });

  /* ── Toast state ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  /* ── Redirect non-authenticated ── */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  /* ── Fetch driver jobs ── */
  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const req = new GetDriverShipmentsRequest();
      req.setDriverId(user.id);
      if (filter) req.setStatusFilter(filter);

      const res = await withTimeout(shipmentServiceClient.getDriverAssignedShipments(req, {}));
      const items = res.getShipmentsList().map(s => s.toObject());
      setJobs(items);
    } catch (err) {
      console.error('fetchJobs error:', err);
      addToast('error', 'Gagal memuat data kiriman. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter, addToast]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchJobs();
    }
  }, [isAuthenticated, user?.id, filter, fetchJobs]);

  /* ── Cleanup GPS on unmount ── */
  useEffect(() => {
    return () => {
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
    };
  }, []);

  /* ── Busy helper ── */
  const markBusy = (id: string) => setBusyIds(prev => new Set(prev).add(id));
  const unmarkBusy = (id: string) => setBusyIds(prev => { const s = new Set(prev); s.delete(id); return s; });

  /* ════════════════════════════════════════════════════════════════════════
     ACTIONS
     ════════════════════════════════════════════════════════════════════════ */

  /** Accept a pending job */
  const handleAcceptJob = async (shipmentId: string) => {
    if (!user?.id) return;
    markBusy(shipmentId);
    try {
      const req = new AcceptJobRequest();
      req.setShipmentId(shipmentId);
      req.setDriverId(user.id);
      const res = await withTimeout(shipmentServiceClient.acceptShipmentJob(req, {}));
      if (res.getSuccess()) {
        addToast('success', `Job diterima! Resi: ${res.getTrackingNumber()}`);
        await fetchJobs();
      } else {
        addToast('error', res.getMessage() || 'Gagal menerima job');
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Gagal menerima job');
    } finally {
      unmarkBusy(shipmentId);
    }
  };

  /** Toggle GPS tracking for a shipment */
  const handleToggleGPS = (shipmentId: string) => {
    if (!user?.id) return;

    // If already tracking this shipment → stop
    if (gpsActive && activeGpsShipmentId === shipmentId) {
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
      setGpsActive(false);
      setActiveGpsShipmentId(null);
      addToast('success', 'Pelacakan GPS dihentikan');
      return;
    }

    // Stop previous if any
    if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);

    if (!navigator.geolocation) {
      addToast('error', 'Browser tidak mendukung GPS');
      return;
    }

    setGpsActive(true);
    setActiveGpsShipmentId(shipmentId);

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLastCoords({ lat: latitude, lng: longitude });
          try {
            const req = new UpdateLocationRequest();
            req.setDriverId(user!.id);
            req.setShipmentId(shipmentId);
            req.setLatitude(latitude);
            req.setLongitude(longitude);
            await withTimeout(shipmentServiceClient.updateDriverLocation(req, {}));
          } catch (err) {
            console.warn('GPS update failed:', err);
          }
        },
        (geoErr) => {
          console.warn('Geolocation error:', geoErr.message);
          addToast('error', `GPS error: ${geoErr.message}`);
        },
        { enableHighAccuracy: true, timeout: 10_000 }
      );
    };

    sendLocation(); // immediate first send
    gpsIntervalRef.current = setInterval(sendLocation, 30_000); // every 30s
    addToast('success', 'Pelacakan GPS aktif — update tiap 30 detik');
  };

  /** Open Complete Delivery modal */
  const openCompleteModal = (shipmentId: string) => {
    if (!user?.id) return;
    setCompleteForm({ recipientName: '', proofFile: null, proofPreview: '', notes: '' });
    setCompleteModal({ shipmentId, driverId: user.id });
  };

  /** Submit Complete Delivery */
  const handleCompleteDelivery = async () => {
    if (!completeModal) return;
    if (!completeForm.recipientName.trim()) {
      addToast('error', 'Nama penerima wajib diisi');
      return;
    }

    markBusy(completeModal.shipmentId);
    try {
      // Convert proof file to data URL (base64) for transport
      let proofUrl = '';
      if (completeForm.proofFile) {
        proofUrl = await fileToDataUrl(completeForm.proofFile);
      }

      const req = new CompleteDeliveryRequest();
      req.setShipmentId(completeModal.shipmentId);
      req.setDriverId(completeModal.driverId);
      req.setProofImageUrl(proofUrl);
      req.setRecipientName(completeForm.recipientName.trim());
      req.setNotes(completeForm.notes.trim());

      const res = await withTimeout(shipmentServiceClient.completeDelivery(req, {}));
      if (res.getSuccess()) {
        addToast('success', `Pengiriman selesai! Resi: ${res.getTrackingNumber()}`);
        setCompleteModal(null);
        // Stop GPS if it was for this shipment
        if (activeGpsShipmentId === completeModal.shipmentId) {
          if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
          gpsIntervalRef.current = null;
          setGpsActive(false);
          setActiveGpsShipmentId(null);
        }
        await fetchJobs();
      } else {
        addToast('error', res.getMessage() || 'Gagal menyelesaikan pengiriman');
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Gagal menyelesaikan pengiriman');
    } finally {
      unmarkBusy(completeModal.shipmentId);
    }
  };

  /** Open COD Modal */
  const openCodModal = (shipmentId: string, codAmount: number) => {
    if (!user?.id) return;
    setCodForm({ amount: '', collectionType: 'DP_PICKUP' });
    setCodModal({ shipmentId, driverId: user.id, codAmount });
  };

  /** Submit COD Collection */
  const handleCollectCOD = async () => {
    if (!codModal) return;
    const amount = parseFloat(codForm.amount.replace(/,/g, '.'));
    if (isNaN(amount) || amount <= 0) {
      addToast('error', 'Masukkan jumlah uang yang valid');
      return;
    }

    markBusy(codModal.shipmentId);
    try {
      const req = new CollectCODRequest();
      req.setShipmentId(codModal.shipmentId);
      req.setDriverId(codModal.driverId);
      req.setAmountCollected(amount);
      req.setCollectionType(codForm.collectionType);

      const res = await withTimeout(shipmentServiceClient.collectCODPayment(req, {}));
      if (res.getSuccess()) {
        addToast('success', `COD terkumpul! Total: ${fmtRp(res.getTotalCollected())}, Sisa: ${fmtRp(res.getRemaining())}`);
        setCodModal(null);
        await fetchJobs();
      } else {
        addToast('error', res.getMessage() || 'Gagal mengumpulkan COD');
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Gagal mengumpulkan COD');
    } finally {
      unmarkBusy(codModal.shipmentId);
    }
  };

  /* ── File helpers ── */
  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  }

  function handleProofFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate: max 5MB, image only
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'Ukuran file maksimal 5 MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCompleteForm(prev => ({ ...prev, proofFile: file, proofPreview: previewUrl }));
  }

  /* ═════════════════════════════════════════════════════════════════════════
     RENDER
     ═════════════════════════════════════════════════════════════════════════ */

  if (authLoading) return null;

  // Not logged in — show login prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="driver-root">
        <div className="driver-login-card">
          <Truck className="w-10 h-10 text-[var(--kb-wood)] mx-auto mb-3" />
          <h2>Portal Driver</h2>
          <p>Silakan login terlebih dahulu untuk mengakses portal driver.</p>
          <Link to="/login" className="hazard-btn px-6 py-2.5">Masuk Sekarang</Link>
        </div>
      </div>
    );
  }

  // Stats
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => j.status === 'PENDING').length;
  const activeJobs = jobs.filter(j => ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(j.status)).length;
  const deliveredJobs = jobs.filter(j => j.status === 'DELIVERED').length;

  const filters: { label: string; value: StatusFilter }[] = [
    { label: 'Semua', value: '' },
    { label: 'Menunggu', value: 'PENDING' },
    { label: 'Dijemput', value: 'PICKED_UP' },
    { label: 'Transit', value: 'IN_TRANSIT' },
    { label: 'Diantar', value: 'OUT_FOR_DELIVERY' },
    { label: 'Selesai', value: 'DELIVERED' },
  ];

  return (
    <div className="driver-root">
      <div className="driver-container">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="driver-header"
        >
          <div className="section-eyebrow">PORTAL DRIVER KURIR</div>
          <h1 className="driver-title">
            <Truck className="inline w-7 h-7 mr-2" />
            Halo, {user.fullName?.split(' ')[0] || 'Driver'}!
          </h1>
          <p className="driver-sub">
            Kelola pengiriman, update lokasi GPS, dan kumpulkan pembayaran COD Anda.
          </p>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="driver-stats"
        >
          {[
            { label: 'Total Job', val: totalJobs, icon: Package },
            { label: 'Menunggu', val: pendingJobs, icon: AlertTriangle },
            { label: 'Aktif', val: activeJobs, icon: Truck },
            { label: 'Selesai', val: deliveredJobs, icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className="driver-stat-card">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-[var(--kb-wood)]" />
              <div className="driver-stat-val">{s.val}</div>
              <div className="driver-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── GPS Panel (if active) ── */}
        {gpsActive && lastCoords && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="driver-gps-panel"
          >
            <div className="driver-gps-title">
              <Navigation className="w-4 h-4 text-[var(--kb-hazard)]" />
              GPS Aktif
            </div>
            <div className="driver-gps-info">
              Lat: {lastCoords.lat.toFixed(6)} &nbsp;|&nbsp; Lng: {lastCoords.lng.toFixed(6)}
            </div>
            <div className="text-xs text-[var(--kb-wood-light)]">Update otomatis setiap 30 detik</div>
          </motion.div>
        )}

        {/* ── Filter Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="driver-filter-bar"
        >
          {filters.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn('driver-filter-btn', filter === f.value && 'active')}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            onClick={fetchJobs}
            disabled={loading}
            className="driver-filter-btn ml-auto flex items-center gap-1"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Refresh
          </button>
        </motion.div>

        {/* ── Job List ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading && jobs.length === 0 ? (
            <div className="driver-empty">
              <RefreshCw className="driver-empty-icon animate-spin" />
              <div className="driver-empty-title">Memuat data...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="driver-empty">
              <Inbox className="driver-empty-icon" />
              <div className="driver-empty-title">Tidak ada job</div>
              <div className="driver-empty-desc">
                {filter
                  ? `Tidak ada pengiriman dengan status "${filter}".`
                  : 'Belum ada pengiriman yang ditugaskan kepada Anda.'}
              </div>
            </div>
          ) : (
            <div className="driver-jobs-list">
              {jobs.map(job => {
                const badge = getStatusBadge(job.status);
                const isBusy = busyIds.has(job.shipmentId);
                const isCOD = job.paymentMethod?.toUpperCase() === 'COD';
                const isGpsActiveForThis = gpsActive && activeGpsShipmentId === job.shipmentId;

                return (
                  <div key={job.shipmentId} className="driver-job-card">
                    {/* Top: resi + status */}
                    <div className="driver-job-top">
                      <div>
                        <span className="driver-detail-label block mb-0.5">No. Resi</span>
                        <span className="driver-job-resi">{job.trackingNumber || '—'}</span>
                      </div>
                      <span className={cn('text-xs font-bold px-2.5 py-1 border', badge.color)}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Details grid */}
                    <div className="driver-job-details">
                      <div>
                        <div className="driver-detail-label">Pengirim</div>
                        <div className="driver-detail-val">{job.senderName}</div>
                        <div className="text-xs text-[var(--kb-wood-light)] mt-0.5">{job.senderPhone}</div>
                      </div>
                      <div>
                        <div className="driver-detail-label">Alamat Jemput</div>
                        <div className="driver-detail-val">{job.senderAddress}</div>
                      </div>
                      <div>
                        <div className="driver-detail-label">Penerima</div>
                        <div className="driver-detail-val">{job.receiverName}</div>
                        <div className="text-xs text-[var(--kb-wood-light)] mt-0.5">{job.receiverPhone}</div>
                      </div>
                      <div>
                        <div className="driver-detail-label">Alamat Tujuan</div>
                        <div className="driver-detail-val">{job.receiverAddress}</div>
                      </div>
                      <div>
                        <div className="driver-detail-label">Berat</div>
                        <div className="driver-detail-val">{job.weightKg} kg</div>
                      </div>
                      <div>
                        <div className="driver-detail-label">Layanan</div>
                        <div className="driver-detail-val uppercase">{job.serviceType}</div>
                      </div>
                      <div>
                        <div className="driver-detail-label">Total Biaya</div>
                        <div className="driver-detail-val">{fmtRp(job.totalCost)}</div>
                      </div>
                      <div>
                        <div className="driver-detail-label">Pembayaran</div>
                        <div className="driver-detail-val">
                          {job.paymentMethod}
                          {isCOD && job.codAmountToCollect > 0 && (
                            <span className="block text-xs mt-0.5 text-[var(--kb-wood-light)]">
                              COD: {fmtRp(job.codAmountToCollect)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="driver-job-actions">
                      {/* Accept Job — only for PENDING */}
                      {job.status === 'PENDING' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleAcceptJob(job.shipmentId)}
                          className="hazard-btn text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          {isBusy ? 'Memproses...' : 'Terima Job'}
                        </button>
                      )}

                      {/* GPS Toggle — for active jobs */}
                      {['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(job.status) && (
                        <button
                          type="button"
                          onClick={() => handleToggleGPS(job.shipmentId)}
                          className={cn(
                            'text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer border-2 border-[var(--kb-wood)] font-bold transition-colors',
                            isGpsActiveForThis
                              ? 'bg-[var(--kb-wood)] text-[var(--kb-hazard)]'
                              : 'bg-[var(--kb-paper)] text-[var(--kb-wood)] hover:bg-[var(--kb-kraft-light)]'
                          )}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {isGpsActiveForThis ? 'Stop GPS' : 'GPS Tracking'}
                        </button>
                      )}

                      {/* COD Collection — for COD jobs that are active */}
                      {isCOD && job.codAmountToCollect > 0 && ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(job.status) && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => openCodModal(job.shipmentId, job.codAmountToCollect)}
                          className="wood-btn text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Kumpul COD
                        </button>
                      )}

                      {/* Complete Delivery — for active jobs */}
                      {['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(job.status) && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => openCompleteModal(job.shipmentId)}
                          className="hazard-btn text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selesaikan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
         MODALS
         ════════════════════════════════════════════════════════════════════ */}

      {/* ── Complete Delivery Modal ── */}
      <AnimatePresence>
        {completeModal && (
          <motion.div
            className="driver-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCompleteModal(null)}
          >
            <motion.div
              className="driver-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="driver-modal-title">
                  <CheckCircle2 className="w-5 h-5" />
                  Selesaikan Pengiriman
                </h3>
                <button
                  type="button"
                  onClick={() => setCompleteModal(null)}
                  className="p-1 cursor-pointer bg-transparent border-none text-[var(--kb-wood)]"
                  aria-label="Tutup modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="driver-input-group">
                <label className="driver-input-label">Nama Penerima *</label>
                <input
                  type="text"
                  className="driver-input"
                  placeholder="Nama lengkap penerima barang"
                  value={completeForm.recipientName}
                  onChange={e => setCompleteForm(p => ({ ...p, recipientName: e.target.value }))}
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="driver-input-group">
                <label className="driver-input-label">
                  <Camera className="w-3.5 h-3.5 inline mr-1" />
                  Foto Bukti Serah Terima
                </label>
                <div className="driver-file-input-wrap">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleProofFileChange}
                    className="driver-input text-xs"
                  />
                </div>
                {completeForm.proofPreview && (
                  <img
                    src={completeForm.proofPreview}
                    alt="Preview bukti"
                    className="driver-proof-preview"
                  />
                )}
              </div>

              <div className="driver-input-group">
                <label className="driver-input-label">Catatan (opsional)</label>
                <textarea
                  className="driver-input"
                  placeholder="Catatan tambahan..."
                  value={completeForm.notes}
                  onChange={e => setCompleteForm(p => ({ ...p, notes: e.target.value }))}
                  maxLength={500}
                />
              </div>

              <div className="driver-modal-actions">
                <button
                  type="button"
                  onClick={() => setCompleteModal(null)}
                  className="px-4 py-1.5 text-xs font-bold border-2 border-[var(--kb-wood)] text-[var(--kb-wood)] bg-[var(--kb-paper)] cursor-pointer hover:bg-[var(--kb-kraft-light)] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCompleteDelivery}
                  disabled={busyIds.has(completeModal.shipmentId)}
                  className="hazard-btn text-xs py-1.5 px-4 cursor-pointer"
                >
                  {busyIds.has(completeModal.shipmentId) ? 'Memproses...' : 'Konfirmasi Selesai'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COD Collection Modal ── */}
      <AnimatePresence>
        {codModal && (
          <motion.div
            className="driver-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCodModal(null)}
          >
            <motion.div
              className="driver-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="driver-modal-title">
                  <DollarSign className="w-5 h-5" />
                  Kumpulkan COD
                </h3>
                <button
                  type="button"
                  onClick={() => setCodModal(null)}
                  className="p-1 cursor-pointer bg-transparent border-none text-[var(--kb-wood)]"
                  aria-label="Tutup modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm text-[var(--kb-wood)] mb-3 font-bold">
                Jumlah COD yang harus dikumpulkan: {fmtRp(codModal.codAmount)}
              </div>

              <div className="driver-input-group">
                <label className="driver-input-label">Tipe Koleksi</label>
                <div className="flex gap-2">
                  {([
                    { value: 'DP_PICKUP' as const, label: 'DP Penjemputan' },
                    { value: 'REMAINING_DELIVERY' as const, label: 'Sisa Pengiriman' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCodForm(p => ({ ...p, collectionType: opt.value }))}
                      className={cn(
                        'px-3 py-1.5 text-xs font-bold border-2 border-[var(--kb-wood)] transition-colors cursor-pointer flex-1',
                        codForm.collectionType === opt.value
                          ? 'bg-[var(--kb-wood)] text-[var(--kb-hazard)]'
                          : 'bg-[var(--kb-paper)] text-[var(--kb-wood)]'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="driver-input-group">
                <label className="driver-input-label">Jumlah Uang Diterima (Rp)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="driver-input"
                  placeholder="contoh: 150000"
                  value={codForm.amount}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setCodForm(p => ({ ...p, amount: val }));
                  }}
                  autoFocus
                />
              </div>

              <div className="driver-modal-actions">
                <button
                  type="button"
                  onClick={() => setCodModal(null)}
                  className="px-4 py-1.5 text-xs font-bold border-2 border-[var(--kb-wood)] text-[var(--kb-wood)] bg-[var(--kb-paper)] cursor-pointer hover:bg-[var(--kb-kraft-light)] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCollectCOD}
                  disabled={busyIds.has(codModal.shipmentId)}
                  className="hazard-btn text-xs py-1.5 px-4 cursor-pointer"
                >
                  {busyIds.has(codModal.shipmentId) ? 'Memproses...' : 'Konfirmasi COD'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toasts ── */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn('driver-toast', t.type)}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

