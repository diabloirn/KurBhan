package handler

import (
	"context"
	"database/sql"

	pb "auth-service/pb"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type AuthHandler struct {
	pb.UnimplementedAuthServiceServer
	DB *sql.DB
}

func NewAuthHandler(db *sql.DB) *AuthHandler {
	return &AuthHandler{DB: db}
}

func (h *AuthHandler) Register(ctx context.Context, req *pb.RegisterRequest) (*pb.RegisterResponse, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.GetPassword()), bcrypt.DefaultCost)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal memproses password: %v", err)
	}

	query := `
		INSERT INTO users (full_name, email, phone_number, password_hash, role, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id
	`
	var userID string
	role := req.GetRole()
	if role == "" {
		role = "customer"
	}

	err = h.DB.QueryRowContext(ctx, query, req.GetFullName(), req.GetEmail(), req.GetPhoneNumber(), string(hashedPassword), role).Scan(&userID)
	if err != nil {
		return nil, status.Errorf(codes.AlreadyExists, "Email atau nomor HP sudah terdaftar: %v", err)
	}

	return &pb.RegisterResponse{
		UserId:  userID,
		Message: "Registrasi berhasil!",
	}, nil
}