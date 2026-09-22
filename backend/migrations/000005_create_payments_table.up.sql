CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method VARCHAR(30) NOT NULL,                    -- BANK_TRANSFER, VIRTUAL_ACCOUNT, COD
    channel VARCHAR(30),                            -- BCA, BLU_BCA, MANDIRI, BNI, BRI
    amount DOUBLE PRECISION NOT NULL,               -- Total tagihan yang harus dibayar
    dp_amount DOUBLE PRECISION DEFAULT 0,           -- Minimal 50% untuk COD
    remaining_amount DOUBLE PRECISION DEFAULT 0,    -- Sisa pembayaran COD saat pengantaran
    va_number VARCHAR(50),                          -- Nomor VA: Prefix Bank + No Telepon Pelanggan
    customer_phone VARCHAR(50),                     -- No Telepon pelanggan untuk VA
    customer_name VARCHAR(255),                     -- Nama pelanggan pemilik VA
    bank_account_number VARCHAR(50),                -- Nomor rekening tujuan transfer KurBhan
    bank_account_name VARCHAR(100),                 -- Nama pemilik rekening KurBhan
    sender_name VARCHAR(255),                       -- Nama lengkap pengirim pada bukti transfer
    sender_phone VARCHAR(50),                       -- Nomor telepon pengirim pada bukti transfer
    amount_transferred DOUBLE PRECISION,            -- Nominal yang benar-benar ditransfer
    bank_sender VARCHAR(100),                       -- Bank asal pengirim
    proof_image_url TEXT,                           -- Bukti transfer (gambar/dokumen)
    transaction_id VARCHAR(100),                    -- ID transaksi unik dari gateway/bank
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, CONFIRMED, REJECTED, EXPIRED
    rejection_reason TEXT,                          -- Alasan penolakan jika tidak lolos validasi
    expired_at TIMESTAMP WITH TIME ZONE,            -- Batas waktu bayar (maksimal 1x24 jam)
    confirmed_at TIMESTAMP WITH TIME ZONE,          -- Waktu pembayaran berhasil diverifikasi
    confirmed_by VARCHAR(100),                      -- Diverifikasi oleh user_id, 'SYSTEM', atau 'WEBHOOK'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_shipment ON payments(shipment_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_va ON payments(va_number);
CREATE INDEX idx_payments_expired ON payments(expired_at);
CREATE UNIQUE INDEX idx_payments_tx_unique ON payments(transaction_id) WHERE transaction_id IS NOT NULL;
