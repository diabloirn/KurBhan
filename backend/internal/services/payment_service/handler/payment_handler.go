package handler

import (
	"database/sql"
	pb "payment-service/pb"
)

type PaymentHandler struct {
	pb.UnimplementedPaymentServiceServer
	DB *sql.DB
}

func NewPaymentHandler(db *sql.DB) *PaymentHandler {
	return &PaymentHandler{DB: db}
}
