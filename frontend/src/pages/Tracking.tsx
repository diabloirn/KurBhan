import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, MapPin, Loader2, CheckCircle2, Truck, Box, Clock, XCircle, Home, RotateCcw } from 'lucide-react';
import { shipmentServiceClient } from '../services/grpcClient';
import { TrackShipmentRequest } from '../proto/kurbhan_pb';
import { getStoredShipments } from '../lib/shipmentStorage';
import { cn } from '../lib/cn';
import './Tracking.css';

interface HistoryItem {
  status: string;
  createdAt?: string | number;
  timestamp?: string | number;
  description: string;
  location?: string;
}

interface ShipmentData {
  trackingNumber: string;
  status: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  serviceType: string;
  weightKg: number;
  totalCost: number;
  historiesList?: HistoryItem[];
}

// Status styling helpers
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'border-[var(--kb-yellow)] bg-[var(--kb-yellow)]/10 text-[var(--kb-yellow)]';
    case 'PICKED_UP': return 'border-[var(--kb-blue)] bg-[var(--kb-blue)]/10 text-[var(--kb-blue)]';
    case 'IN_TRANSIT': return 'border-[var(--kb-blue)] bg-[var(--kb-blue)]/10 text-[var(--kb-blue)]';
    case 'OUT_FOR_DELIVERY': return 'border-[var(--kb-purple)] bg-[var(--kb-purple)]/10 text-[var(--kb-purple)]';
    case 'DELIVERED': return 'border-[var(--kb-green)] bg-[var(--kb-green)]/10 text-[var(--kb-green)]';
    case 'CANCELLED': return 'border-[var(--kb-red)] bg-[var(--kb-red)]/10 text-[var(--kb-red)]';
    default: return 'border-[var(--kb-gray-2)] bg-[var(--kb-gray-5)] text-[var(--kb-gray-2)]';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING': return Clock;
    case 'PICKED_UP': return Box;
    case 'IN_TRANSIT': return Truck;
    case 'OUT_FOR_DELIVERY': return Home;
    case 'DELIVERED': return CheckCircle2;
    case 'CANCELLED': return XCircle;
    default: return Package;
  }
};

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

const formatTimestamp = (createdAt?: string | number, timestamp?: string | number) => {
  const time = createdAt || timestamp;
  if (!time) return '-';
  const date = new Date(time);
  return isNaN(date.getTime()) ? '-' : date.toLocaleString('id-ID');
};

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(() => searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipment, setShipment] = useState<ShipmentData | null>(null);

  const queryShipment = async (queryNum: string) => {
    const trimmed = queryNum.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setShipment(null);

    try {
      const req = new TrackShipmentRequest();
      req.setTrackingNumber(trimmed);

      const res = await shipmentServiceClient.trackShipment(req, {});
      const data = res.toObject() as unknown as ShipmentData;
      
      if (data && data.trackingNumber) {
        setShipment(data);
      } else {
        throw new Error('Resi tidak ditemukan di server');
      }
    } catch {
      // Graceful fallback to local stored shipments
      const localList = getStoredShipments();
      const match = localList.find(s => s.trackingNumber.toLowerCase() === trimmed.toLowerCase());
      
      if (match) {
        const fallbackData: ShipmentData = {
          trackingNumber: match.trackingNumber,
          status: match.status,
          senderName: match.senderName,
          senderPhone: match.senderPhone,
          senderAddress: match.senderAddress,
          receiverName: match.receiverName,
          receiverPhone: match.receiverPhone,
          receiverAddress: match.receiverAddress,
          serviceType: match.serviceType,
          weightKg: match.weightKg,
          totalCost: match.totalCost,
          historiesList: [
            {
              status: match.status,
              createdAt: match.createdAt,
              description: match.status === 'DELIVERED' 
                ? 'Paket telah diterima dengan aman di tujuan.'
                : match.status === 'IN_TRANSIT'
                ? 'Paket sedang dalam perjalanan menuju hub tujuan.'
                : match.status === 'PICKED_UP'
                ? 'Paket telah dijemput oleh armada KurBhan.'
                : match.status === 'CANCELLED'
                ? 'Pengiriman telah dibatalkan.'
                : 'Manifest pesanan telah dibuat, menunggu penjemputan armada.',
              location: match.originLocation,
            }
          ]
        };
        setShipment(fallbackData);
      } else {
        setError('Paket tidak ditemukan. Pastikan format nomor resi benar (cth: KB-20260901-ABC1).');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paramId = searchParams.get('id');
    if (paramId) {
      const timer = setTimeout(() => {
        void queryShipment(paramId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault();
    await queryShipment(trackingNumber);
  };

  return (
    <div className="tracking-root">
      {/* Hero */}
      <section className="tracking-hero">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="tracking-hero-container"
        >
          <div className="section-eyebrow">LACAK KIRIMAN REAL-TIME</div>
          <h1 className="section-headline">Pantau Status Paket Anda.</h1>
          <p className="section-copy max-w-xl mx-auto">
            Masukkan nomor resi KurBhan untuk mengetahui status dan lokasi terkini paket Anda secara end-to-end.
          </p>
        </motion.div>

        {/* Search */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleTrack}
          className="tracking-search-form"
        >
          <div className="glass-card tracking-search-card">
            <div className="tracking-search-input-wrap">
              <Search className="tracking-search-icon" />
              <input
                type="text"
                placeholder="Nomor Resi (cth: KB-20260901-ABC1)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="apple-input tracking-search-input"
              />
            </div>
            <button type="submit" disabled={loading} className="hazard-btn tracking-search-btn">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Lacak Resi'}
            </button>
          </div>
        </motion.form>
      </section>

      {/* Content */}
      <section className="tracking-content">
        {error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="tracking-error-box"
          >
            <div className="font-bold mb-1">Pencarian Belum Berhasil</div>
            <div>{error}</div>
          </motion.div>
        )}

        {loading && !shipment && !error && (
          <div className="tracking-loading-wrap">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-[var(--kb-blue)]" />
          </div>
        )}

        {/* Not Found */}
        {!loading && !error && !shipment && trackingNumber.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="neo-card tracking-notfound-card"
          >
            <Package className="tracking-notfound-icon" />
            <div className="tracking-notfound-title">Paket Tidak Ditemukan</div>
            <div className="tracking-notfound-desc">
              Pastikan nomor resi yang Anda masukkan sesuai format (KB-XXXXXXXX). Periksa kembali resi dari bukti pemesanan atau dashboard Anda.
            </div>
          </motion.div>
        )}

        {/* Results */}
        {shipment && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tracking-results-wrap"
          >
            {/* Info Card */}
            <div className="glass-neo-card tracking-info-card">
              <div className="tracking-info-header">
                <div>
                  <div className="tracking-info-resi-label">Nomor Resi KurBhan</div>
                  <div className="tracking-info-resi-val">{shipment.trackingNumber}</div>
                </div>
                <div className={cn("badge-neo px-4 py-2", getStatusColor(shipment.status))}>
                  {shipment.status}
                </div>
              </div>

              <div className="tracking-info-parties">
                <div>
                  <div className="tracking-party-label">Pengirim</div>
                  <div className="tracking-party-name">{shipment.senderName}</div>
                  <div className="tracking-party-phone">{shipment.senderPhone}</div>
                  <div className="tracking-party-address">{shipment.senderAddress}</div>
                </div>
                <div>
                  <div className="tracking-party-label">Penerima</div>
                  <div className="tracking-party-name">{shipment.receiverName}</div>
                  <div className="tracking-party-phone">{shipment.receiverPhone}</div>
                  <div className="tracking-party-address">{shipment.receiverAddress}</div>
                </div>
              </div>

              <div className="tracking-info-specs">
                <div>
                  <div className="tracking-spec-label">Layanan</div>
                  <div className="tracking-spec-val uppercase">{shipment.serviceType}</div>
                </div>
                <div>
                  <div className="tracking-spec-label">Berat</div>
                  <div className="tracking-spec-val">{shipment.weightKg} kg</div>
                </div>
                <div>
                  <div className="tracking-spec-label">Total Biaya</div>
                  <div className="tracking-spec-val">{formatRupiah(shipment.totalCost)}</div>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="neo-card tracking-timeline-card">
              <div className="flex items-center justify-between mb-8">
                <h3 className="tracking-timeline-title mb-0">Riwayat Perjalanan Manifest</h3>
                <button 
                  onClick={() => queryShipment(shipment.trackingNumber)} 
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--kb-black)] bg-white shadow-[1px_1px_0px_var(--kb-black)] cursor-pointer hover:translate-x-[-1px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refresh Status</span>
                </button>
              </div>
              
              <div className="tracking-timeline-list">
                {shipment.historiesList?.map((history: HistoryItem, index: number) => {
                  const Icon = getStatusIcon(history.status);
                  
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="tracking-timeline-item"
                    >
                      {/* Circle on border */}
                      <div className={cn(
                        "tracking-timeline-node",
                        getStatusColor(history.status)
                      )}>
                        <Icon className="w-3 h-3" />
                      </div>
                      
                      <div className="tracking-timeline-body">
                        <div className="tracking-timeline-header">
                          <div className="tracking-timeline-status">{history.status}</div>
                          <div className="tracking-timeline-time">
                            {formatTimestamp(history.createdAt, history.timestamp)}
                          </div>
                        </div>
                        <div className="tracking-timeline-desc">{history.description}</div>
                        {history.location && (
                          <div className="tracking-timeline-loc">
                            <MapPin className="w-4 h-4" />
                            <span>{history.location}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
