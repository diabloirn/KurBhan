package handler

import (
	"context"
	"database/sql"
	"errors"

	pb "shipment-service/pb"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (h *ShipmentHandler) CancelShipment(ctx context.Context, req *pb.CancelShipmentRequest) (*pb.ShipmentResponse, error) {
	// 1. Validasi shipment exists dan status masih CREATED/PENDING
	queryCheck := `
		SELECT id, status, total_price, created_at
		FROM shipments
		WHERE id = $1
	`

	var shipmentID, statusStr string
	var totalPrice float64
	var createdAtStr string

	err := h.DB.QueryRowContext(ctx, queryCheck, req.GetShipmentId()).Scan(&shipmentID, &statusStr, &totalPrice, &createdAtStr)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, status.Errorf(codes.NotFound, "Pengiriman dengan ID %s tidak ditemukan", req.GetShipmentId())
	} else if err != nil {
		return nil, status.Errorf(codes.Internal, "Database error: %v", err)
	}

	// 2. Validasi status - hanya bisa cancel jika status CREATED atau PENDING
	if statusStr != "CREATED" && statusStr != "PENDING" {
		return nil, status.Errorf(codes.FailedPrecondition, 
			"Tidak dapat membatalkan pengiriman dengan status %s. Hanya CREATED atau PENDING yang dapat dibatalkan", statusStr)
	}

	// 3. Validasi ownership - user yang request harus pemilik shipment
	queryOwner := `
		SELECT user_id FROM shipments WHERE id = $1
	`
	var ownerID string
	err = h.DB.QueryRowContext(ctx, queryOwner, req.GetShipmentId()).Scan(&ownerID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Database error: %v", err)
	}

	if ownerID != req.GetUserId() {
		return nil, status.Errorf(codes.PermissionDenied, "Anda tidak memiliki izin untuk membatalkan pengiriman ini")
	}

	// 4. Transaksi: Update status ke CANCELLED + catat history
	tx, err := h.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memulai transaksi: %v", err)
	}
	defer tx.Rollback()

	queryUpdate := `
		UPDATE shipments
		SET status = 'CANCELLED', updated_at = NOW()
		WHERE id = $1
		RETURNING id
	`
	var updatedID string
	err = tx.QueryRowContext(ctx, queryUpdate, req.GetShipmentId()).Scan(&updatedID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal membatalkan pengiriman: %v", err)
	}

	// 5. Catat ke shipment_histories
	queryHistory := `
		INSERT INTO shipment_histories (shipment_id, status, description, location, created_at)
		VALUES ($1, 'CANCELLED', 'Pengiriman dibatalkan oleh pengguna', 'N/A', NOW())
	`
	_, err = tx.ExecContext(ctx, queryHistory, req.GetShipmentId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mencatat riwayat pembatalan: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal commit transaksi: %v", err)
	}

	return &pb.ShipmentResponse{
		ShipmentId:  shipmentID,
		Status:      "CANCELLED",
		TotalPrice:  totalPrice,
		CreatedAt:   nil, // TODO: handle timestamp conversion if needed
	}, nil
}
