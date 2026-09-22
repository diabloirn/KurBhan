import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, CheckCircle2, Package, QrCode } from 'lucide-react';
import './WaybillModal.css';

export interface WaybillData {
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  originLocation: string;
  destinationLocation: string;
  weightKg: number;
  serviceType: string;
  vehicleType: string;
  totalCost: number;
  paymentMethod: string;
  paymentStatus: 'UNPAID' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  vaNumber?: string;
  createdAt: string;
}

interface WaybillModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WaybillData | null;
  isSuccessNotification?: boolean;
}

export default function WaybillModal({ isOpen, onClose, data, isSuccessNotification }: WaybillModalProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = data.paymentStatus === 'VERIFIED';

  return (
    <AnimatePresence>
      <div className="waybill-backdrop" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="waybill-dialog"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="waybill-header">
            <h3 className="waybill-header-title">
              <Package className="w-5 h-5" />
              <span>KURBHAN WAYBILL & RESI FISIK</span>
            </h3>
            <button 
              onClick={onClose} 
              className="waybill-close-btn"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Celebratory Banner if just paid */}
          {isSuccessNotification && (
            <div className="waybill-success-banner">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-white" />
              <div>
                <h4>Pembayaran Berhasil Diverifikasi!</h4>
                <p>Status pengiriman Anda kini resmi <strong>LUNAS</strong>. Cetak resi berikut untuk ditempel pada paket.</p>
              </div>
            </div>
          )}

          {/* Body / Printable Sheet */}
          <div className="waybill-body">
            <div className="waybill-sheet">
              {/* Brand row */}
              <div className="waybill-brand-row">
                <div>
                  <div className="waybill-logo-text">KURBHAN LOGISTIK</div>
                  <div className="waybill-tagline">Warehouse, Freight & Waybill Manifest</div>
                </div>
                <div className="text-right">
                  <div className="waybill-service-badge">
                    {data.serviceType.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono mt-0.5">
                    {new Date(data.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* Barcode & Tracking Number */}
              <div className="waybill-barcode-section">
                <div className="waybill-barcode-bars" />
                <div className="waybill-tracking-no">{data.trackingNumber}</div>
              </div>

              {/* Sender & Receiver Address Grid */}
              <div className="waybill-address-grid">
                {/* Pengirim */}
                <div className="waybill-address-col">
                  <div className="waybill-col-label">1. PENGIRIM (ORIGIN)</div>
                  <div className="waybill-person-name">{data.senderName}</div>
                  <div className="waybill-phone">{data.senderPhone}</div>
                  <div className="waybill-full-addr">{data.senderAddress}</div>
                  <div className="mt-1 text-[11px] font-bold text-gray-800">
                    HUB: {data.originLocation}
                  </div>
                </div>

                {/* Penerima */}
                <div className="waybill-address-col">
                  <div className="waybill-col-label">2. PENERIMA (DESTINATION)</div>
                  <div className="waybill-person-name">{data.receiverName}</div>
                  <div className="waybill-phone">{data.receiverPhone}</div>
                  <div className="waybill-full-addr">{data.receiverAddress}</div>
                  <div className="mt-1 text-[11px] font-bold text-gray-800">
                    HUB: {data.destinationLocation}
                  </div>
                </div>
              </div>

              {/* Package Specs */}
              <div className="waybill-specs-grid">
                <div className="waybill-spec-item">
                  <div className="waybill-col-label">Berat Paket</div>
                  <div className="waybill-spec-val">{data.weightKg} Kg</div>
                </div>
                <div className="waybill-spec-item">
                  <div className="waybill-col-label">Armada</div>
                  <div className="waybill-spec-val uppercase text-[11px]">
                    {data.vehicleType.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="waybill-spec-item">
                  <div className="waybill-col-label">Metode Bayar</div>
                  <div className="waybill-spec-val text-[11px] uppercase">
                    {data.paymentMethod}
                  </div>
                </div>
                <div className="waybill-spec-item">
                  <div className="waybill-col-label">Kode Ref</div>
                  <div className="waybill-spec-val font-mono text-[10px]">
                    {data.vaNumber ? `VA: ${data.vaNumber}` : 'DIRECT'}
                  </div>
                </div>
              </div>

              {/* Payment Status & Total */}
              <div className="waybill-payment-row">
                <div className="waybill-price-block">
                  <div className="waybill-col-label">Total Biaya Pengiriman:</div>
                  <div className="waybill-price-val">
                    Rp {data.totalCost.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    *Termasuk PPN & Asuransi Manifest
                  </div>
                </div>

                {/* Physical Stamp */}
                <div className={`waybill-stamp ${isPaid ? '' : 'unpaid'}`}>
                  {isPaid ? 'LUNAS / PAID' : 'BELUM LUNAS'}
                </div>

                <div className="flex items-center gap-1.5 text-gray-400 opacity-60">
                  <QrCode className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="waybill-footer">
            <button 
              type="button" 
              onClick={onClose}
              className="paper-btn text-xs px-4 py-2"
            >
              Tutup
            </button>
            <button 
              type="button" 
              onClick={handlePrint}
              className="hazard-btn text-xs px-5 py-2 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Resi (Print / PDF)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
