package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"time"

	"github.com/bradfitz/gomemcache/memcache"
	pb "kurbhan/gen/v1"
)

type RateService struct {
	pb.UnimplementedRateServiceServer
	db         *sql.DB
	memcached  *memcache.Client
}

func NewRateService(db *sql.DB, memcachedHost string) *RateService {
	mc := memcache.New(memcachedHost)
	return &RateService{
		db:        db,
		memcached: mc,
	}
}

func (s *RateService) CalculateRate(ctx context.Context, req *pb.CalculateRateRequest) (*pb.CalculateRateResponse, error) {
	// 1. Generate Key Cache (Berdasarkan parameter pengiriman)
	cacheKey := fmt.Sprintf("rate:%s:%s:%.2f:%.2f:%.2f:%.2f:%s:%s",
		req.OriginVillageId, req.DestinationVillageId,
		req.ActualWeightKg, req.LengthCm, req.WidthCm, req.HeightCm,
		req.VehicleType, req.ServiceType,
	)

	// 2. Cek apakah hasil ada di Memcached
	if item, err := s.memcached.Get(cacheKey); err == nil {
		var cachedResp pb.CalculateRateResponse
		if err := json.Unmarshal(item.Value, &cachedResp); err == nil {
			return &cachedResp, nil
		}
	}

	// 3. Ambil Kode Provinsi Asal & Tujuan
	originProv, err := s.getProvinceIDByVillage(req.OriginVillageId)
	if err != nil {
		return nil, fmt.Errorf("origin village not found: %v", err)
	}

	destProv, err := s.getProvinceIDByVillage(req.DestinationVillageId)
	if err != nil {
		return nil, fmt.Errorf("destination village not found: %v", err)
	}

	// 4. Deteksi Pengiriman Antar-Pulau (Cross-Island)
	isCrossIsland, err := s.checkCrossIsland(originProv, destProv)
	if err != nil {
		return nil, fmt.Errorf("failed to check island status: %v", err)
	}

	// 5. Kalkulasi Volumetric Weight & Chargeable Weight
	// Rumus Logistik Standar: (P x L x T) / 6000 (Reguler/Darat/Laut) atau / 5000 (Udara/Express)
	divisor := 6000.0
	if req.ServiceType == "cepat" && isCrossIsland {
		divisor = 5000.0 // Kargo udara menggunakan pembagi 5000
	}

	volumetricWeight := (req.LengthCm * req.WidthCm * req.HeightCm) / divisor
	chargeableWeight := math.Max(req.ActualWeightKg, volumetricWeight)

	// 6. Hitung Base Rate dan Multiplier Modal Transportasi
	basePricePerKg := 10000.0 // Tarif dasar per KG

	// Multiplier Jenis Layanan
	serviceMultiplier := 1.0
	switch req.ServiceType {
	case "cepat":
		serviceMultiplier = 1.5
	case "sameday":
		serviceMultiplier = 2.2
	}

	// Multiplier Jenis Armada / Transit
	vehicleMultiplier := 1.0
	switch req.VehicleType {
	case "mobil_box_sedang":
		vehicleMultiplier = 1.3
	case "mobil_box_besar":
		vehicleMultiplier = 1.8
	}

	// Biaya Tambahan Antar-Pulau (Laut / Udara)
	crossIslandFee := 0.0
	if isCrossIsland {
		if req.ServiceType == "cepat" {
			crossIslandFee = 25000.0 // Surcharge Kargo Udara
		} else {
			crossIslandFee = 12000.0 // Surcharge Kargo Laut
		}
	}

	// Total Harga Akhir
	totalPrice := (chargeableWeight * basePricePerKg * serviceMultiplier * vehicleMultiplier) + crossIslandFee

	// 7. Estimasi Hari Pengiriman
	minDays, maxDays := "2", "4"
	if req.ServiceType == "sameday" {
		minDays, maxDays = "0", "1"
	} else if req.ServiceType == "cepat" {
		minDays, maxDays = "1", "2"
	} else if isCrossIsland {
		minDays, maxDays = "4", "7" // Jalur Laut Reguler Antar-Pulau
	}

	response := &pb.CalculateRateResponse{
		VolumetricWeightKg: math.Round(volumetricWeight*100) / 100,
		ChargeableWeightKg: math.Round(chargeableWeight*100) / 100,
		TotalPrice:         math.Round(totalPrice),
		IsCrossIsland:      isCrossIsland,
		EstimatedMinDays:   minDays,
		EstimatedMaxDays:   maxDays,
	}

	// 8. Simpan Hasil ke Memcached (TTL 1 Jam)
	if jsonBytes, err := json.Marshal(response); err == nil {
		_ = s.memcached.Set(&memcache.Item{
			Key:        cacheKey,
			Value:      jsonBytes,
			Expiration: int32((1 * time.Hour).Seconds()),
		})
	}

	return response, nil
}

// Helper: Query Provinsi Asal/Tujuan dari ID Kelurahan
func (s *RateService) getProvinceIDByVillage(villageID string) (string, error) {
	query := `
		SELECT r.province_id 
		FROM villages v
		JOIN districts d ON v.district_id = d.id
		JOIN regencies r ON d.regency_id = r.id
		WHERE v.id = $1 LIMIT 1;
	`
	var provinceID string
	err := s.db.QueryRow(query, villageID).Scan(&provinceID)
	return provinceID, err
}

// Helper: Cek apakah kedua provinsi berada di pulau yang sama (menggunakan flag is_java_island)
func (s *RateService) checkCrossIsland(originProvID, destProvID string) (bool, error) {
	if originProvID == destProvID {
		return false, nil
	}

	query := `SELECT id, is_java_island FROM provinces WHERE id IN ($1, $2);`
	rows, err := s.db.Query(query, originProvID, destProvID)
	if err != nil {
		return false, err
	}
	defer rows.Close()

	javaStatus := make(map[string]bool)
	for rows.Next() {
		var id string
		var isJava bool
		if err := rows.Scan(&id, &isJava); err != nil {
			return false, err
		}
		javaStatus[id] = isJava
	}

	// Jika salah satu berada di Jawa dan satunya di luar Jawa -> Cross Island
	// Jika keduanya di luar Jawa dan beda provinsi -> Cross Island
	if javaStatus[originProvID] != javaStatus[destProvID] {
		return true, nil
	}
	if !javaStatus[originProvID] && !javaStatus[destProvID] && (originProvID != destProvID) {
		return true, nil
	}

	return false, nil
}