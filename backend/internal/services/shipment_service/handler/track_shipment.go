package handler

import (
	"context"
	"database/sql"
	"errors"

	pb "shipment-service/pb"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (h *ShipmentHandler) TrackShipment(ctx context.Context, req *pb.TrackShipmentRequest) (*pb.TrackShipmentResponse, error) {
	// 1. Ambil Detail Shipment Berdasarkan Resi
	queryShipment := `
		SELECT id, tracking_number, sender_name, sender_address, receiver_name, receiver_address,
		       weight_kg, service_type, total_cost, status, created_at
		FROM shipments
		WHERE tracking_number = $1
	`

	var shipment pb.ShipmentProto
	var createdAtStr string

	err := h.DB.QueryRowContext(ctx, queryShipment, req.GetTrackingNumber()).Scan(
		&shipment.Id, &shipment.TrackingNumber, &shipment.SenderName, &shipment.SenderAddress,
		&shipment.ReceiverName, &shipment.ReceiverAddress, &shipment.WeightKg,
		&shipment.ServiceType, &shipment.TotalCost, &shipment.Status, &createdAtStr,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, status.Errorf(codes.NotFound, "Nomor resi %s tidak ditemukan", req.GetTrackingNumber())
	} else if err != nil {
		return nil, status.Errorf(codes.Internal, "Database error: %v", err)
	}

	// 2. Ambil Riwayat Perjalanan Paket
	queryHistories := `
		SELECT status, description, location, created_at
		FROM shipment_histories
		WHERE shipment_id = $1
		ORDER BY created_at DESC
	`

	rows, err := h.DB.QueryContext(ctx, queryHistories, shipment.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mengambil riwayat tracking: %v", err)
	}
	defer rows.Close()

	var histories []*pb.TrackingHistoryProto
	for rows.Next() {
		var hProto pb.TrackingHistoryProto
		if err := rows.Scan(&hProto.Status, &hProto.Description, &hProto.Location, &hProto.Timestamp); err != nil {
			return nil, status.Errorf(codes.Internal, "Gagal parse riwayat tracking: %v", err)
		}
		histories = append(histories, &hProto)
	}

	return &pb.TrackShipmentResponse{
		Shipment:  &shipment,
		Histories: histories,
	}, nil
}