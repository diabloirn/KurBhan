package handler

import (
	"context"

	pb "shipment-service/pb"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (h *ShipmentHandler) UpdateShipmentStatus(ctx context.Context, req *pb.UpdateShipmentStatusRequest) (*pb.UpdateShipmentStatusResponse, error) {
	tx, err := h.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memulai transaksi: %v", err)
	}
	defer tx.Rollback()

	// 1. Update Status di Tabel Shipments
	queryUpdate := `
		UPDATE shipments
		SET status = $1, updated_at = NOW()
		WHERE tracking_number = $2
		RETURNING id
	`
	var shipmentID string
	err = tx.QueryRowContext(ctx, queryUpdate, req.GetStatus(), req.GetTrackingNumber()).Scan(&shipmentID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "Nomor resi %s tidak ditemukan atau gagal diupdate: %v", req.GetTrackingNumber(), err)
	}

	// 2. Tambahkan Entry Baru ke Shipment History
	queryHistory := `
		INSERT INTO shipment_histories (shipment_id, status, description, location, created_at)
		VALUES ($1, $2, $3, $4, NOW())
	`
	_, err = tx.ExecContext(ctx, queryHistory, shipmentID, req.GetStatus(), req.GetDescription(), req.GetLocation())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mencatat riwayat status baru: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal commit transaksi: %v", err)
	}

	return &pb.UpdateShipmentStatusResponse{
		Success: true,
		Message: "Status pengiriman berhasil diperbarui!",
	}, nil
}