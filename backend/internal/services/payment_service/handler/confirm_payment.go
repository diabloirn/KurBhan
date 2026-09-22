package handler

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "payment-service/pb"
)

// CrossCheckBankTransfer memvalidasi kelengkapan dan kesesuaian data transfer bank manual:
// Memeriksa nama lengkap pengirim, nomor telepon, bukti transfer, batas waktu 1x24 jam, dan kesesuaian nominal.
func CrossCheckBankTransfer(
	paymentAmount float64,
	paymentStatus string,
	expiredAt time.Time,
	senderName string,
	senderPhone string,
	amountTransferred float64,
	proofImageUrl string,
	currentTime time.Time,
) (isValid bool, status string, reason string) {
	// 1. Cek Batas Waktu 1x24 Jam (Expiry Check)
	if currentTime.After(expiredAt) {
		return false, "EXPIRED", "Batas waktu pembayaran 1x24 jam telah berakhir"
	}

	// 2. Cek Status Saat Ini
	if paymentStatus == "CONFIRMED" {
		return true, "VERIFIED", "Pembayaran sudah diverifikasi sebelumnya"
	}
	if paymentStatus != "PENDING" {
		return false, "REJECTED", fmt.Sprintf("Status pembayaran tidak valid: %s", paymentStatus)
	}

	// 3. Validasi Kelengkapan Data Pengirim & Bukti Transfer
	trimmedName := strings.TrimSpace(senderName)
	if len(trimmedName) < 3 {
		return false, "REJECTED", "Nama lengkap pengirim wajib diisi minimal 3 karakter"
	}

	_, err := CleanAndValidatePhoneNumber(senderPhone)
	if err != nil {
		return false, "REJECTED", fmt.Sprintf("Nomor telepon pengirim tidak valid: %v", err)
	}

	trimmedProof := strings.TrimSpace(proofImageUrl)
	if trimmedProof == "" {
		return false, "REJECTED", "Bukti transfer (struk/screenshot) wajib diunggah"
	}

	// 4. Crosscheck Kesesuaian Nominal Transfer terhadap Tagihan
	if math.Abs(paymentAmount-amountTransferred) > 0.01 {
		return false, "REJECTED", fmt.Sprintf(
			"Nominal bukti transfer (Rp %.0f) tidak cocok dengan total tagihan (Rp %.0f)",
			amountTransferred, paymentAmount,
		)
	}

	return true, "VERIFIED", "Data transfer dan bukti pembayaran terverifikasi cocok"
}

// ConfirmPayment melakukan verifikasi dan crosscheck pembayaran transfer bank manual.
// Backend memeriksa apakah nama lengkap, nomor telepon, nominal, dan bukti transfer sesuai dengan tagihan.
func (h *PaymentHandler) ConfirmPayment(ctx context.Context, req *pb.ConfirmPaymentRequest) (*pb.ConfirmPaymentResponse, error) {
	if req.PaymentId == "" {
		return nil, status.Error(codes.InvalidArgument, "Payment ID diperlukan")
	}

	// 1. Query data pembayaran di database
	query := `
		SELECT id, shipment_id, user_id, amount, status, expired_at
		FROM payments
		WHERE id = $1
	`

	var paymentID, shipmentID, userID, currentStatus string
	var billAmount float64
	var expiredAt time.Time

	err := h.DB.QueryRowContext(ctx, query, req.PaymentId).Scan(
		&paymentID, &shipmentID, &userID, &billAmount, &currentStatus, &expiredAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, status.Error(codes.NotFound, "Data pembayaran tidak ditemukan")
		}
		return nil, status.Errorf(codes.Internal, "Gagal memeriksa data pembayaran: %v", err)
	}

	// 2. Jalankan algoritma crosscheck transfer
	now := time.Now()
	isValid, newStatus, reason := CrossCheckBankTransfer(
		billAmount, currentStatus, expiredAt,
		req.SenderName, req.SenderPhone, req.AmountTransferred, req.ProofImageUrl,
		now,
	)

	// Jika verifikasi gagal (nominal beda, data tidak lengkap, atau sudah kedaluwarsa)
	if !isValid {
		updateRejectQuery := `
			UPDATE payments
			SET status = $1, rejection_reason = $2, updated_at = NOW()
			WHERE id = $3
		`
		_, _ = h.DB.ExecContext(ctx, updateRejectQuery, newStatus, reason, paymentID)

		return &pb.ConfirmPaymentResponse{
			Success:         false,
			Message:         fmt.Sprintf("Verifikasi transfer gagal: %s", reason),
			PaymentId:       paymentID,
			Status:          newStatus,
			RejectionReason: reason,
		}, nil
	}

	// Jika sudah pernah dikonfirmasi sebelumnya (idempotency)
	if currentStatus == "CONFIRMED" {
		return &pb.ConfirmPaymentResponse{
			Success:   true,
			Message:   "Pembayaran ini telah diverifikasi sebelumnya",
			PaymentId: paymentID,
			Status:    "VERIFIED",
		}, nil
	}

	// 3. Eksekusi transaksi atomik di database
	tx, err := h.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memulai transaksi database: %v", err)
	}
	defer tx.Rollback()

	confirmedBy := req.ConfirmedBy
	if confirmedBy == "" {
		confirmedBy = "SYSTEM_VERIFY"
	}

	updatePaymentQuery := `
		UPDATE payments
		SET status = 'CONFIRMED',
		    confirmed_at = NOW(),
		    confirmed_by = $1,
		    sender_name = $2,
		    sender_phone = $3,
		    amount_transferred = $4,
		    bank_sender = $5,
		    proof_image_url = $6,
		    updated_at = NOW()
		WHERE id = $7
	`

	_, err = tx.ExecContext(ctx, updatePaymentQuery,
		confirmedBy, req.SenderName, req.SenderPhone, req.AmountTransferred,
		req.BankSender, req.ProofImageUrl, paymentID,
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memperbarui status pembayaran: %v", err)
	}

	// Update shipment status menjadi siap dijemput/diproses
	updateShipmentQuery := `
		UPDATE shipments
		SET status = 'PICKED_UP', updated_at = NOW()
		WHERE id = $1
	`
	_, err = tx.ExecContext(ctx, updateShipmentQuery, shipmentID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memperbarui status pengiriman: %v", err)
	}

	// Catat riwayat tracking
	insertHistoryQuery := `
		INSERT INTO shipment_histories (shipment_id, status, description, location, created_at)
		VALUES ($1, 'PICKED_UP', $2, 'Finance Hub KurBhan', NOW())
	`
	historyDesc := fmt.Sprintf(
		"Pembayaran transfer bank sejumlah Rp %.0f dari %s (%s) telah diverifikasi lunas.",
		req.AmountTransferred, req.SenderName, req.SenderPhone,
	)
	_, err = tx.ExecContext(ctx, insertHistoryQuery, shipmentID, historyDesc)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mencatat riwayat pengiriman: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal menyelesaikan transaksi database: %v", err)
	}

	return &pb.ConfirmPaymentResponse{
		Success:   true,
		Message:   "Pembayaran transfer bank berhasil diverifikasi dan dikonfirmasi!",
		PaymentId: paymentID,
		Status:    "VERIFIED",
	}, nil
}
