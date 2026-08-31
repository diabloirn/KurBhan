package main

import (
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"

	"rate-service/handler"
	pb "rate-service/pb"

	"github.com/bradfitz/gomemcache/memcache"
	_ "github.com/lib/pq"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "50052"
	}

	dbURI := os.Getenv("DB_URI")
	if dbURI == "" {
		log.Fatal("DB_URI environment variable is required")
	}

	memcachedHost := os.Getenv("MEMCACHED_HOST")
	if memcachedHost == "" {
		memcachedHost = "memcached:11211"
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
	log.Println("Rate Service: Berhasil terhubung ke Supabase DB!")

	// 2. Koneksi ke Memcached
	mcClient := memcache.New(memcachedHost)
	log.Printf("Rate Service: Terhubung ke Memcached di %s", memcachedHost)

	// 3. Setup Listener gRPC
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Gagal me-listen port %s: %v", port, err)
	}

	grpcServer := grpc.NewServer()

	// 4. Register Rate Handler
	rateHandler := handler.NewRateHandler(db, mcClient)
	pb.RegisterRateServiceServer(grpcServer, rateHandler)

	// Enable Reflection untuk testing
	reflection.Register(grpcServer)

	log.Printf("Rate Microservice berjalan di port :%s ...", port)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Gagal menjalankan gRPC server: %v", err)
	}
}