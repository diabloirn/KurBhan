package handler

import (
	"context"
	"fmt"
	"time"

	pb "shipment-service/pb"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (h *ShipmentHandler) CreateShipment(ctx context.Context, req *pb.CreateShipmentRequest) (*pb.CreateShipmentResponse, error) {
	// 0. Input Validation
	if req.GetUserId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "user_id is required")
	}
	if req.GetWeightKg() <= 0 {
		return nil, status.Errorf(codes.InvalidArgument, "weight_kg must be greater than 0")
	}
	if req.GetTotalCost() < 0 {
		return nil, status.Errorf(codes.InvalidArgument, "total_cost must be non-negative")
	}

	// 1. Generate Nomor Resi Unik (Contoh: KB-20260831-XXXX)
	trackingNumber := fmt.Sprintf("KB-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:6])

	// 2. Transaksi Database (Simpan Shipment & Initial Tracking History)
	tx, err := h.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memulai transaksi: %v", err)
	}
	defer tx.Rollback()

	queryShipment := `
		INSERT INTO shipments (
			tracking_number, user_id, sender_name, sender_address, sender_phone,
			receiver_name, receiver_address, receiver_phone,
			origin_village_id, destination_village_id,
			weight_kg, service_type, total_cost, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING', NOW(), NOW())
		RETURNING id, status, created_at
	`

	var shipmentID string
	var statusStr string
	var createdAt time.Time

	err = tx.QueryRowContext(ctx, queryShipment,
		trackingNumber, req.GetUserId(), req.GetSenderName(), req.GetSenderAddress(), req.GetSenderPhone(),
		req.GetReceiverName(), req.GetReceiverAddress(), req.GetReceiverPhone(),
		req.GetOriginVillageId(), req.GetDestinationVillageId(),
		req.GetWeightKg(), req.GetServiceType(), req.GetTotalCost(),
	).Scan(&shipmentID, &statusStr, &createdAt)

	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal menyimpan pengiriman: %v", err)
	}

	// 3. Catat Riwayat Tracking Pertama (Status PENDING)
	queryHistory := `
		INSERT INTO shipment_histories (shipment_id, status, description, location, created_at)
		VALUES ($1, 'PENDING', 'Pesanan pengiriman berhasil dibuat', $2, NOW())
	`
	_, err = tx.ExecContext(ctx, queryHistory, shipmentID, req.GetSenderAddress())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal menyimpan riwayat tracking: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal commit transaksi: %v", err)
	}

	return &pb.CreateShipmentResponse{
		ShipmentId:     shipmentID,
		TrackingNumber: trackingNumber,
		Status:         statusStr,
		Message:        "Pengiriman berhasil dibuat!",
	}, nil
}