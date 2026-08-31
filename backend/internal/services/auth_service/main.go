package main

import (
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"

	"auth-service/handler"
	pb "auth-service/pb"

	_ "github.com/lib/pq"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "50051"
	}

	dbURI := os.Getenv("DB_URI")
	if dbURI == "" {
		log.Fatal("DB_URI environment variable is required")
	}

	// 1. Koneksi ke Supabase PostgreSQL
	db, err := sql.Open("postgres", dbURI)
	if err != nil {
		log.Fatalf("Gagal membuka koneksi DB: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Gagal terhubung ke DB: %v", err)
	}
	log.Println("Berhasil terhubung ke Supabase DB!")

	// 2. Setup Listener gRPC
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Gagal me-listen port %s: %v", port, err)
	}

	grpcServer := grpc.NewServer()

	// 3. Register Auth Handler (Register & Login)
	authHandler := handler.NewAuthHandler(db)
	pb.RegisterAuthServiceServer(grpcServer, authHandler)

	// Enable Reflection untuk testing (Postman/gRPCurl)
	reflection.Register(grpcServer)

	log.Printf("Auth Microservice berjalan di port :%s ...", port)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Gagal menjalankan gRPC server: %v", err)
	}
}