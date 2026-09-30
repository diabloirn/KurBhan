import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, AlertCircle, Copy, FileCheck, Camera, Trash2
} from 'lucide-react';
import type { StoredShipment } from '../lib/shipmentStorage';
import { cn } from '../lib/cn';
import './UploadProofModal.css';

export interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: StoredShipment | null;
  onSuccess: (trackingNumber: string, proofUrl: string, senderName: string, senderPhone: string) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function UploadProofModal({
  isOpen,
  onClose,
  shipment,
  onSuccess,
}: UploadProofModalProps) {
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeText, setFileSizeText] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize/reset form whenever shipment changes
  useEffect(() => {
    if (shipment) {
      setSenderName(shipment.senderTransferName || shipment.senderName || '');
      setSenderPhone(shipment.senderTransferPhone || shipment.senderPhone || '');
      setPreviewUrl(shipment.transferProofUrl || '');
      setFileName(shipment.transferProofUrl ? 'bukti_sebelumnya.jpg' : '');
      setFileSizeText('');
      setErrorMessage(null);
    }
  }, [shipment, isOpen]);

  if (!isOpen || !shipment) return null;

  const targetAccount = shipment.bankAccountNumber || '8890123456';
  const targetBank = shipment.paymentChannel || 'BCA';
  const targetAccountName = shipment.bankAccountName || 'PT KurBhan Logistik Indonesia';

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(targetAccount);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const processFile = (file: File) => {
    setErrorMessage(null);

    // 1. Security Check: File MIME Type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Format berkas tidak valid. Harap pilih gambar (JPG, PNG, WEBP).');
      return;
    }

    // 2. Security Check: Max File Size (5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`Ukuran berkas melebihi batas maksimal 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    const sizeStr = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    setFileName(file.name);
    setFileSizeText(sizeStr);

    // Read file as Base64 Data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Gagal membaca berkas gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    setFileName('');
    setFileSizeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = senderName.trim();
    if (trimmedName.length < 3) {
      setErrorMessage('Nama pengirim rekening minimal 3 karakter.');
      return;
    }

    const cleanedPhone = senderPhone.replace(/[^0-9]/g, '');
    if (cleanedPhone.length < 9) {
      setErrorMessage('Nomor telepon pengirim minimal 9 digit.');
      return;
    }

    if (!previewUrl) {
      setErrorMessage('Harap unggah struk atau tangkapan layar bukti transfer.');
      return;
    }

    setIsSubmitting(true);
    try {
      onSuccess(shipment.trackingNumber, previewUrl, trimmedName, cleanedPhone);
      onClose();
    } catch {
      setErrorMessage('Terjadi kesalahan saat menyimpan bukti transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="proof-modal-backdrop" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="proof-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="proof-modal-header">
            <h3 className="proof-modal-title">
              <FileCheck className="w-5 h-5 text-[var(--kb-wood)]" />
              Unggah Bukti Transfer Bank
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 cursor-pointer bg-transparent border-none text-[var(--kb-wood)] hover:opacity-70"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Ringkasan Pembayaran */}
          <div className="proof-summary-box space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-[var(--kb-wood)]/20 pb-1.5">
              <span className="font-mono text-[var(--kb-wood-light)] font-bold">Nomor Resi:</span>
              <span className="font-mono font-bold text-[var(--kb-wood)] text-sm">{shipment.trackingNumber}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--kb-wood)]/20 pb-1.5">
              <span className="text-[var(--kb-wood-light)] font-bold">Total Tagihan:</span>
              <span className="font-bold text-[var(--kb-wood)] text-sm">
                Rp {shipment.totalCost.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <div className="text-[var(--kb-wood-light)] font-bold mb-1">Rekening Tujuan ({targetBank}):</div>
              <div className="flex items-center justify-between bg-[var(--kb-paper)] p-2 border border-[var(--kb-wood)] font-mono">
                <div>
                  <div className="font-bold text-[var(--kb-wood)] text-sm">{targetAccount}</div>
                  <div className="text-[10px] text-[var(--kb-wood-light)]">a.n. {targetAccountName}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-2 py-1 bg-[var(--kb-kraft-light)] border border-[var(--kb-wood)] text-[10px] font-bold text-[var(--kb-wood)] flex items-center gap-1 cursor-pointer hover:bg-[var(--kb-hazard)]"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedAccount ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Nama Pengirim */}
            <div>
              <label className="font-bold text-[var(--kb-wood)] block mb-1">
                Nama Pemilik Rekening Pengirim *
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Sesuai nama pada struk / mutasi bank"
                className="cargo-input w-full text-xs font-semibold"
                required
              />
            </div>

            {/* Nomor HP Pengirim */}
            <div>
              <label className="font-bold text-[var(--kb-wood)] block mb-1">
                Nomor Telepon / WhatsApp Pengirim *
              </label>
              <input
                type="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="cargo-input w-full text-xs font-mono font-semibold"
                required
              />
            </div>

            {/* Area File Picker & Drag-Drop */}
            <div>
              <label className="font-bold text-[var(--kb-wood)] block mb-1">
                Foto Struk / Screenshot Bukti Transfer *
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleFileInputChange}
                className="hidden"
                id="proof-file-input"
              />

              {!previewUrl ? (
                <div
                  className={cn("proof-dropzone", isDragging && "dragging")}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <div className="p-2.5 bg-[var(--kb-kraft-light)] border border-[var(--kb-wood)] rounded-full">
                      <Camera className="w-5 h-5 text-[var(--kb-wood)]" />
                    </div>
                    <div className="font-bold text-[var(--kb-wood)] text-xs">
                      Klik untuk Memilih File atau Jepret Foto
                    </div>
                    <div className="text-[10px] text-[var(--kb-wood-light)]">
                      Format JPG, PNG, WEBP (Maksimal 5 MB)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="proof-preview-container">
                    <img
                      src={previewUrl}
                      alt="Pratinjau Bukti Transfer"
                      className="proof-preview-image"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="proof-preview-remove"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--kb-wood-light)] px-1">
                    <span className="truncate max-w-[200px] font-mono">{fileName || 'bukti_transfer.jpg'}</span>
                    {fileSizeText && <span className="font-mono font-bold">{fileSizeText}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1 text-[11px] border border-[var(--kb-wood)] bg-[var(--kb-paper-dark)] text-[var(--kb-wood)] font-bold cursor-pointer hover:bg-[var(--kb-kraft-light)]"
                  >
                    Ganti Foto Bukti
                  </button>
                </div>
              )}
            </div>

            {/* Pesan Kesalahan */}
            {errorMessage && (
              <div className="p-2 border border-red-400 bg-red-100 text-red-800 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Aksi Modal */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--kb-wood)]/20 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="paper-btn text-xs px-4 py-2 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !previewUrl}
                className="hazard-btn text-xs px-5 py-2 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
