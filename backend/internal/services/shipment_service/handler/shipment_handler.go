package handler

import (
	"database/sql"
	pb "shipment-service/pb"
)

type ShipmentHandler struct {
	pb.UnimplementedShipmentServiceServer
	DB *sql.DB
}

func NewShipmentHandler(db *sql.DB) *ShipmentHandler {
	return &ShipmentHandler{DB: db}
}