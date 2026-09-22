package handler

import (
	"context"
	"database/sql"
	"time"
	pb "shipment-service/pb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func ValidateAcceptJob(driverID, shipmentID string) error {
	if driverID == "" || shipmentID == "" {
		return status.Error(codes.InvalidArgument, "driver_id dan shipment_id harus diisi")
	}
	return nil
}

// AcceptShipmentJob menerima pekerjaan pengiriman oleh driver.
func (h *ShipmentHandler) AcceptShipmentJob(ctx context.Context, req *pb.AcceptJobRequest) (*pb.AcceptJobResponse, error) {
	if err := ValidateAcceptJob(req.DriverId, req.ShipmentId); err != nil {
		return nil, err
	}

	tx, err := h.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memulai transaksi: %v", err)
	}
	defer tx.Rollback()

	var statusDB string
	var assignedDriverID sql.NullString
	var trackingNumber string

	err = tx.QueryRowContext(ctx, "SELECT status, assigned_driver_id, tracking_number FROM shipments WHERE id = $1 FOR UPDATE", req.ShipmentId).
		Scan(&statusDB, &assignedDriverID, &trackingNumber)

	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "Pengiriman tidak ditemukan")
	} else if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memeriksa status pengiriman: %v", err)
	}

	if statusDB != "PENDING" {
		return nil, status.Error(codes.FailedPrecondition, "Pengiriman tidak dalam status PENDING")
	}

	if assignedDriverID.Valid && assignedDriverID.String != "" {
		return nil, status.Error(codes.AlreadyExists, "Pengiriman sudah diterima oleh driver lain")
	}

	_, err = tx.ExecContext(ctx,
		"UPDATE shipments SET assigned_driver_id = $1, driver_accepted_at = $2, status = 'PICKED_UP' WHERE id = $3",
		req.DriverId, time.Now(), req.ShipmentId,
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mengupdate pengiriman: %v", err)
	}

	_, err = tx.ExecContext(ctx,
		"INSERT INTO shipment_history (shipment_id, status, description, created_at) VALUES ($1, 'PICKED_UP', 'Pengiriman telah diambil oleh driver', $2)",
		req.ShipmentId, time.Now(),
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal menyimpan riwayat: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal commit transaksi: %v", err)
	}

	return &pb.AcceptJobResponse{
		Success:        true,
		Message:        "Pekerjaan berhasil diterima",
		TrackingNumber: trackingNumber,
	}, nil
}
