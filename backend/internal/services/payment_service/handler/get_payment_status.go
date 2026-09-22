package handler

import (
	"context"
	"database/sql"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "payment-service/pb"
)

func (h *PaymentHandler) GetPaymentStatus(ctx context.Context, req *pb.GetPaymentStatusRequest) (*pb.GetPaymentStatusResponse, error) {
	if req.PaymentId == "" {
		return nil, status.Error(codes.InvalidArgument, "Payment ID diperlukan")
	}

	query := `
		SELECT id, shipment_id, method, COALESCE(channel, ''), amount, dp_amount, remaining_amount, 
		       COALESCE(va_number, ''), status, expired_at, confirmed_at, created_at,
		       COALESCE(customer_phone, ''), COALESCE(customer_name, ''),
		       COALESCE(sender_name, ''), COALESCE(sender_phone, ''),
		       COALESCE(amount_transferred, 0), COALESCE(rejection_reason, '')
		FROM payments
		WHERE id = $1
	`

	row := h.DB.QueryRowContext(ctx, query, req.PaymentId)

	var res pb.GetPaymentStatusResponse
	var expiredAt, confirmedAt, createdAt sql.NullTime

	err := row.Scan(
		&res.PaymentId,
		&res.ShipmentId,
		&res.Method,
		&res.Channel,
		&res.Amount,
		&res.DpAmount,
		&res.RemainingAmount,
		&res.VaNumber,
		&res.Status,
		&expiredAt,
		&confirmedAt,
		&createdAt,
		&res.CustomerPhone,
		&res.CustomerName,
		&res.SenderName,
		&res.SenderPhone,
		&res.AmountTransferred,
		&res.RejectionReason,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, status.Error(codes.NotFound, "Pembayaran tidak ditemukan")
		}
		return nil, status.Errorf(codes.Internal, "Gagal mengambil status pembayaran: %v", err)
	}

	if expiredAt.Valid {
		res.ExpiredAt = expiredAt.Time.Format(time.RFC3339)
	}
	if confirmedAt.Valid {
		res.ConfirmedAt = confirmedAt.Time.Format(time.RFC3339)
	}
	if createdAt.Valid {
		res.CreatedAt = createdAt.Time.Format(time.RFC3339)
	}

	return &res, nil
}
