package handler

import (
	"context"
	"database/sql"
	pb "shipment-service/pb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func ValidateCODAmount(amountCollected, targetAmount float64) error {
	if amountCollected < targetAmount {
		return status.Error(codes.InvalidArgument, "Uang yang diterima kurang dari yang diharapkan")
	}
	return nil
}

// CollectCODPayment mengumpulkan pembayaran COD (DP atau Sisa).
func (h *ShipmentHandler) CollectCODPayment(ctx context.Context, req *pb.CollectCODRequest) (*pb.CollectCODResponse, error) {
	if req.DriverId == "" || req.ShipmentId == "" {
		return nil, status.Error(codes.InvalidArgument, "driver_id dan shipment_id harus diisi")
	}

	tx, err := h.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memulai transaksi: %v", err)
	}
	defer tx.Rollback()

	var paymentMethod string
	var dpAmount, remainingAmount float64

	err = tx.QueryRowContext(ctx, `
		SELECT p.method, p.dp_amount, p.remaining_amount
		FROM shipments s
		JOIN payments p ON s.id = p.shipment_id
		WHERE s.id = $1 AND s.assigned_driver_id = $2 FOR UPDATE
	`, req.ShipmentId, req.DriverId).Scan(&paymentMethod, &dpAmount, &remainingAmount)

	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "Pengiriman tidak ditemukan atau driver tidak valid")
	} else if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal membaca data pengiriman/pembayaran: %v", err)
	}

	if paymentMethod != "COD" {
		return nil, status.Error(codes.FailedPrecondition, "Metode pembayaran bukan COD")
	}

	var totalCollected, remaining float64

	if req.CollectionType == "DP_PICKUP" {
		if err := ValidateCODAmount(req.AmountCollected, dpAmount); err != nil {
			return nil, err
		}
		_, err = tx.ExecContext(ctx, "UPDATE shipments SET cod_dp_collected = $1 WHERE id = $2", req.AmountCollected, req.ShipmentId)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Gagal update dp collected: %v", err)
		}
		totalCollected = req.AmountCollected
		remaining = remainingAmount
	} else if req.CollectionType == "REMAINING_DELIVERY" {
		if err := ValidateCODAmount(req.AmountCollected, remainingAmount); err != nil {
			return nil, err
		}
		_, err = tx.ExecContext(ctx, "UPDATE shipments SET cod_remaining_collected = $1 WHERE id = $2", req.AmountCollected, req.ShipmentId)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Gagal update remaining collected: %v", err)
		}
		totalCollected = dpAmount + req.AmountCollected
		remaining = 0

		// Update payment status to paid if remaining is collected
		_, err = tx.ExecContext(ctx, "UPDATE payments SET status = 'PAID' WHERE shipment_id = $1", req.ShipmentId)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Gagal update status pembayaran: %v", err)
		}
	} else {
		return nil, status.Error(codes.InvalidArgument, "collection_type tidak valid")
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal commit transaksi: %v", err)
	}

	return &pb.CollectCODResponse{
		Success:        true,
		Message:        "Pembayaran berhasil dikumpulkan",
		TotalCollected: totalCollected,
		Remaining:      remaining,
	}, nil
}
