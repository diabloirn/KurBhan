package main

import (
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"

	_ "github.com/lib/pq"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	pb "kurbhan/gen/v1"
	"kurbhan/internal/service"
)

func main() {
	// 1. Ambil Environment Variable
	dbURI := os.Getenv("DB_URI")
	if dbURI == "" {
		log.Fatal("DB_URI environment variable is not set")
	}

	memcachedHost := os.Getenv("MEMCACHED_HOST")
	if memcachedHost == "" {
		memcachedHost = "localhost:11211"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "50051"
	}

	// 2. Koneksi ke Database Supabase PostgreSQL
	log.Println("Connecting to Supabase Database...")
	db, err := sql.Open("postgres", dbURI)
	if err != nil {
		log.Fatalf("Failed to open database connection: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Successfully connected to Supabase Database!")

	// 3. Inisialisasi gRPC Listener
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Failed to listen on port %s: %v", port, err)
	}

	// 4. Inisialisasi gRPC Server & Register Service
	grpcServer := grpc.NewServer()

	// Inisialisasi & Register RateService
	rateService := service.NewRateService(db, memcachedHost)
	pb.RegisterRateServiceServer(grpcServer, rateService)

	// Registrasi gRPC Reflection untuk kemudahan pengujian via gRPCurl / Postman
	reflection.Register(grpcServer)

	log.Printf("KurBhan Backend gRPC Server active on port :%s ...\n", port)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve gRPC: %v", err)
	}
}