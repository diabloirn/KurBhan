package handler

import (
	"context"
	"database/sql"
	pb "shipment-service/pb"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// GetDriverAssignedShipments mengambil daftar pengiriman yang ditugaskan ke driver.
func (h *ShipmentHandler) GetDriverAssignedShipments(ctx context.Context, req *pb.GetDriverShipmentsRequest) (*pb.GetDriverShipmentsResponse, error) {
	if req.DriverId == "" {
		return nil, status.Error(codes.InvalidArgument, "driver_id tidak boleh kosong")
	}

	query := `
		SELECT s.id, s.tracking_number, s.weight_kg, s.service_type, s.status, s.created_at,
		       p.method, p.dp_amount, p.remaining_amount
		FROM shipments s
		LEFT JOIN payments p ON s.id = p.shipment_id
		WHERE s.assigned_driver_id = $1
	`
	args := []interface{}{req.DriverId}

	if req.StatusFilter != "" {
		query += " AND s.status = $2"
		args = append(args, req.StatusFilter)
	}

	rows, err := h.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mengambil data pengiriman: %v", err)
	}
	defer rows.Close()

	var items []*pb.DriverShipmentItem
	var totalCount int32

	for rows.Next() {
		var item pb.DriverShipmentItem
		var method sql.NullString
		var dpAmount, remainingAmount sql.NullFloat64

		err := rows.Scan(
			&item.ShipmentId, &item.TrackingNumber, &item.WeightKg, &item.ServiceType, &item.Status, &item.CreatedAt,
			&method, &dpAmount, &remainingAmount,
		)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Gagal memindai data pengiriman: %v", err)
		}

		if method.Valid {
			item.PaymentMethod = method.String
		}
		if remainingAmount.Valid {
			item.CodAmountToCollect = remainingAmount.Float64
		}

		items = append(items, &item)
		totalCount++
	}

	return &pb.GetDriverShipmentsResponse{
		Shipments:  items,
		TotalCount: totalCount,
	}, nil
}
