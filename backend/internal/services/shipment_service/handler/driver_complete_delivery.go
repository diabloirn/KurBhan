package handler

import (
	"context"
	"database/sql"
	"time"
	pb "shipment-service/pb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func ValidateCompleteDelivery(driverID, shipmentID string) error {
	if driverID == "" || shipmentID == "" {
		return status.Error(codes.InvalidArgument, "driver_id dan shipment_id harus diisi")
	}
	return nil
}

// CompleteDelivery menyelesaikan pengiriman oleh driver.
func (h *ShipmentHandler) CompleteDelivery(ctx context.Context, req *pb.CompleteDeliveryRequest) (*pb.CompleteDeliveryResponse, error) {
	if err := ValidateCompleteDelivery(req.DriverId, req.ShipmentId); err != nil {
		return nil, err
	}

	tx, err := h.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memulai transaksi: %v", err)
	}
	defer tx.Rollback()

	var assignedDriverID sql.NullString
	var trackingNumber string

	err = tx.QueryRowContext(ctx, "SELECT assigned_driver_id, tracking_number FROM shipments WHERE id = $1 FOR UPDATE", req.ShipmentId).
		Scan(&assignedDriverID, &trackingNumber)

	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "Pengiriman tidak ditemukan")
	} else if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mengambil data pengiriman: %v", err)
	}

	if !assignedDriverID.Valid || assignedDriverID.String != req.DriverId {
		return nil, status.Error(codes.PermissionDenied, "Driver tidak ditugaskan untuk pengiriman ini")
	}

	now := time.Now()
	_, err = tx.ExecContext(ctx,
		"UPDATE shipments SET status = 'DELIVERED', delivery_proof_url = $1 WHERE id = $2",
		req.ProofImageUrl, req.ShipmentId,
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mengupdate pengiriman: %v", err)
	}

	_, err = tx.ExecContext(ctx,
		"INSERT INTO shipment_history (shipment_id, status, description, created_at) VALUES ($1, 'DELIVERED', 'Pengiriman telah selesai', $2)",
		req.ShipmentId, now,
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal menyimpan riwayat: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal commit transaksi: %v", err)
	}

	return &pb.CompleteDeliveryResponse{
		Success:        true,
		Message:        "Pengiriman selesai",
		TrackingNumber: trackingNumber,
		CompletedAt:    now.Format(time.RFC3339),
	}, nil
}
