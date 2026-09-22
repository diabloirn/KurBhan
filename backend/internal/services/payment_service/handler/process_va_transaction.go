package handler

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "payment-service/pb"
)

// ValidateVATransaction melakukan verifikasi apakah uang transfer masuk benar-benar sesuai
// dengan tagihan, nomor tujuan Virtual Account, dan masih dalam batas waktu 1x24 jam.
func ValidateVATransaction(
	paymentAmount float64,
	paymentStatus string,
	expiredAt time.Time,
	transferredAmount float64,
	currentTime time.Time,
) (isValid bool, status string, reason string) {
	// 1. Cek Batas Waktu 1x24 Jam (Expiry Check)
	if currentTime.After(expiredAt) {
		return false, "EXPIRED", "Batas waktu pembayaran 1x24 jam telah berakhir"
	}

	// 2. Cek Idempotensi (Replay Attack Prevention)
	if paymentStatus == "CONFIRMED" {
		return true, "CONFIRMED", "Pembayaran sudah diverifikasi sebelumnya"
	}

	// 3. Cek Status Saat Ini
	if paymentStatus != "PENDING" {
		return false, "REJECTED", fmt.Sprintf("Status pembayaran tidak valid: %s", paymentStatus)
	}

	// 4. Cek Kesesuaian Nominal (Amount Tampering & Exact Amount Matching)
	if math.Abs(paymentAmount-transferredAmount) > 0.01 {
		return false, "REJECTED", fmt.Sprintf(
			"Nominal pembayaran Rp %.0f tidak sesuai dengan tagihan Rp %.0f",
			transferredAmount, paymentAmount,
		)
	}

	// Semua validasi lolos
	return true, "CONFIRMED", "Pembayaran Virtual Account berhasil diverifikasi otomatis"
}

// ProcessVATransaction menangani callback/webhook otomatis ketika uang masuk ke nomor Virtual Account.
// Sistem membaca database untuk memverifikasi kecocokan nomor VA, nominal uang, dan batas waktu 1x24 jam.
// Jika cocok -> DITERIMA (CONFIRMED) & status pengiriman diperbarui.
// Jika tidak cocok -> DITOLAK (REJECTED/EXPIRED).
func (h *PaymentHandler) ProcessVATransaction(ctx context.Context, req *pb.ProcessVATransactionRequest) (*pb.ProcessVATransactionResponse, error) {
	if req.VaNumber == "" {
		return nil, status.Error(codes.InvalidArgument, "Nomor Virtual Account diperlukan")
	}
	if req.Amount <= 0 {
		return nil, status.Error(codes.InvalidArgument, "Nominal transaksi harus lebih besar dari 0")
	}

	// 1. Query pembayaran berdasarkan nomor VA di database
	query := `
		SELECT id, shipment_id, user_id, amount, status, expired_at
		FROM payments
		WHERE va_number = $1
		ORDER BY created_at DESC
		LIMIT 1
	`

	var paymentID, shipmentID, userID, currentStatus string
	var billAmount float64
	var expiredAt time.Time

	err := h.DB.QueryRowContext(ctx, query, req.VaNumber).Scan(
		&paymentID, &shipmentID, &userID, &billAmount, &currentStatus, &expiredAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return &pb.ProcessVATransactionResponse{
				Success:         false,
				Status:          "REJECTED",
				Message:         "Nomor Virtual Account tidak ditemukan dalam sistem KurBhan",
				RejectionReason: "Nomor Virtual Account tidak terdaftar",
			}, nil
		}
		return nil, status.Errorf(codes.Internal, "Gagal memeriksa data pembayaran di database: %v", err)
	}

	// 2. Jalankan algoritma validasi transaksi
	now := time.Now()
	isValid, newStatus, reason := ValidateVATransaction(billAmount, currentStatus, expiredAt, req.Amount, now)

	// Jika pembayaran kedaluwarsa atau ditolak
	if !isValid {
		updateRejectQuery := `
			UPDATE payments
			SET status = $1, rejection_reason = $2, updated_at = NOW()
			WHERE id = $3
		`
		_, _ = h.DB.ExecContext(ctx, updateRejectQuery, newStatus, reason, paymentID)

		return &pb.ProcessVATransactionResponse{
			Success:         false,
			Status:          newStatus,
			Message:         fmt.Sprintf("Transaksi VA ditolak: %s", reason),
			PaymentId:       paymentID,
			ShipmentId:      shipmentID,
			RejectionReason: reason,
		}, nil
	}

	// Jika transaksi sudah pernah dikonfirmasi sebelumnya (idempotent callback)
	if currentStatus == "CONFIRMED" {
		return &pb.ProcessVATransactionResponse{
			Success:    true,
			Status:     "CONFIRMED",
			Message:    "Transaksi VA telah dikonfirmasi sebelumnya",
			PaymentId:  paymentID,
			ShipmentId: shipmentID,
		}, nil
	}

	// 3. Eksekusi transaksi atomik di database:
	// Update status pembayaran -> Update status shipment -> Catat riwayat tracking
	tx, err := h.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memulai transaksi database: %v", err)
	}
	defer tx.Rollback()

	// Update payments table
	updatePaymentQuery := `
		UPDATE payments
		SET status = 'CONFIRMED',
		    confirmed_at = NOW(),
		    confirmed_by = 'SYSTEM_VA_AUTO',
		    transaction_id = $1,
		    amount_transferred = $2,
		    updated_at = NOW()
		WHERE id = $3
	`
	_, err = tx.ExecContext(ctx, updatePaymentQuery, req.TransactionId, req.Amount, paymentID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memperbarui status pembayaran: %v", err)
	}

	// Update shipments table (status berubah menjadi siap jemput / diproses)
	updateShipmentQuery := `
		UPDATE shipments
		SET status = 'PICKED_UP', updated_at = NOW()
		WHERE id = $1
	`
	_, err = tx.ExecContext(ctx, updateShipmentQuery, shipmentID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memperbarui status pengiriman: %v", err)
	}

	// Tambahkan catatan riwayat tracking
	insertHistoryQuery := `
		INSERT INTO shipment_histories (shipment_id, status, description, location, created_at)
		VALUES ($1, 'PICKED_UP', $2, 'Sistem Pembayaran KurBhan', NOW())
	`
	historyDesc := fmt.Sprintf(
		"Pembayaran otomatis Virtual Account (%s) sejumlah Rp %.0f berhasil diterima dan diverifikasi sistem.",
		req.VaNumber, req.Amount,
	)
	_, err = tx.ExecContext(ctx, insertHistoryQuery, shipmentID, historyDesc)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mencatat riwayat pengiriman: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal menyelesaikan transaksi database: %v", err)
	}

	return &pb.ProcessVATransactionResponse{
		Success:    true,
		Status:     "ACCEPTED",
		Message:    "Pembayaran Virtual Account berhasil diterima dan diverifikasi!",
		ShipmentId: shipmentID,
		PaymentId:  paymentID,
	}, nil
}
