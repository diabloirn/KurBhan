package main

import (
	"database/sql"
	"log"
	"net"
	"os"

	_ "github.com/lib/pq"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"payment-service/handler"
	pb "payment-service/pb"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "50054"
	}

	dbURI := os.Getenv("DB_URI")
	if dbURI == "" {
		log.Fatal("DB_URI environment variable is not set")
	}

	db, err := sql.Open("postgres", dbURI)
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Database tidak dapat di-ping: %v", err)
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("Gagal listen di port %s: %v", port, err)
	}

	s := grpc.NewServer()
	h := handler.NewPaymentHandler(db)
	pb.RegisterPaymentServiceServer(s, h)

	// Register reflection service on gRPC server
	reflection.Register(s)

	log.Printf("Payment Service berjalan di port %s", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Gagal melayani gRPC: %v", err)
	}
}
