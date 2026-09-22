package handler

import (
	"context"
	"time"
	pb "shipment-service/pb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// UpdateDriverLocation memperbarui lokasi terkini dari driver.
func (h *ShipmentHandler) UpdateDriverLocation(ctx context.Context, req *pb.UpdateLocationRequest) (*pb.UpdateLocationResponse, error) {
	if req.DriverId == "" || req.ShipmentId == "" {
		return nil, status.Error(codes.InvalidArgument, "driver_id dan shipment_id harus diisi")
	}

	// Update the location fields in the shipments table
	query := `
		UPDATE shipments
		SET driver_latitude = $1, driver_longitude = $2, driver_location_updated_at = $3
		WHERE id = $4 AND assigned_driver_id = $5
	`
	res, err := h.DB.ExecContext(ctx, query, req.Latitude, req.Longitude, time.Now(), req.ShipmentId, req.DriverId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal mengupdate lokasi: %v", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memeriksa hasil update: %v", err)
	}

	if rowsAffected == 0 {
		return nil, status.Error(codes.NotFound, "Pengiriman tidak ditemukan atau driver tidak sesuai")
	}

	return &pb.UpdateLocationResponse{
		Success: true,
		Message: "Lokasi berhasil diupdate",
	}, nil
}
