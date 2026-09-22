package handler

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"os"
	"time"

	pb "auth-service/pb"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var jwtSecret []byte

func init() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}
	jwtSecret = []byte(secret)
}

func (h *AuthHandler) Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error) {
	var userID, fullName, role, hashedPassword string

	query := `SELECT id, full_name, role, password_hash FROM users WHERE email = $1`
	err := h.DB.QueryRowContext(ctx, query, req.GetEmail()).Scan(&userID, &fullName, &role, &hashedPassword)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, status.Errorf(codes.NotFound, "Email atau password salah")
	} else if err != nil {
		return nil, status.Errorf(codes.Internal, "Database error: %v", err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.GetPassword()))
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "Email atau password salah")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal membuat token: %v", err)
	}

	return &pb.LoginResponse{
		Token: tokenString,
		User: &pb.UserProto{
			Id:       userID,
			FullName: fullName,
			Email:    req.GetEmail(),
			Role:     role,
		},
	}, nil
}
