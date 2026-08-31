package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"time"

	pb "rate-service/pb"

	"github.com/bradfitz/gomemcache/memcache"
)

type RateHandler struct {
	pb.UnimplementedRateServiceServer
	db        *sql.DB
	memcached *memcache.Client
}

func NewRateHandler(db *sql.DB, mc *memcache.Client) *RateHandler {
	return &RateHandler{
		db:        db,
		memcached: mc,
	}
}

func (s *RateHandler) CalculateRate(ctx context.Context, req *pb.CalculateRateRequest) (*pb.CalculateRateResponse, error) {
	// 1. Generate Key Cache
	cacheKey := fmt.Sprintf("rate:%s:%s:%.2f:%.2f:%.2f:%.2f:%s:%s",
		req.OriginVillageId, req.DestinationVillageId,
		req.ActualWeightKg, req.LengthCm, req.WidthCm, req.HeightCm,
		req.VehicleType, req.ServiceType,
	)

	// 2. Cek Memcached
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

	// 4. Deteksi Pengiriman Antar-Pulau
	isCrossIsland, err := s.checkCrossIsland(originProv, destProv)
	if err != nil {
		return nil, fmt.Errorf("failed to check island status: %v", err)
	}

	// 5. Kalkulasi Volumetric Weight & Chargeable Weight
	divisor := 6000.0
	if req.ServiceType == "cepat" && isCrossIsland {
		divisor = 5000.0
	}

	volumetricWeight := (req.LengthCm * req.WidthCm * req.HeightCm) / divisor
	chargeableWeight := math.Max(req.ActualWeightKg, volumetricWeight)

	// 6. Hitung Base Rate & Multiplier
	basePricePerKg := 10000.0

	serviceMultiplier := 1.0
	switch req.ServiceType {
	case "cepat":
		serviceMultiplier = 1.5
	case "sameday":
		serviceMultiplier = 2.2
	}

	vehicleMultiplier := 1.0
	switch req.VehicleType {
	case "mobil_box_sedang":
		vehicleMultiplier = 1.3
	case "mobil_box_besar":
		vehicleMultiplier = 1.8
	}

	crossIslandFee := 0.0
	if isCrossIsland {
		if req.ServiceType == "cepat" {
			crossIslandFee = 25000.0
		} else {
			crossIslandFee = 12000.0
		}
	}

	totalPrice := (chargeableWeight * basePricePerKg * serviceMultiplier * vehicleMultiplier) + crossIslandFee

	// 7. Estimasi Hari Pengiriman
	minDays, maxDays := "2", "4"
	if req.ServiceType == "sameday" {
		minDays, maxDays = "0", "1"
	} else if req.ServiceType == "cepat" {
		minDays, maxDays = "1", "2"
	} else if isCrossIsland {
		minDays, maxDays = "4", "7"
	}

	response := &pb.CalculateRateResponse{
		VolumetricWeightKg: math.Round(volumetricWeight*100) / 100,
		ChargeableWeightKg: math.Round(chargeableWeight*100) / 100,
		TotalPrice:         math.Round(totalPrice),
		IsCrossIsland:      isCrossIsland,
		EstimatedMinDays:   minDays,
		EstimatedMaxDays:   maxDays,
	}

	// 8. Simpan ke Memcached (TTL 1 Jam)
	if jsonBytes, err := json.Marshal(response); err == nil {
		_ = s.memcached.Set(&memcache.Item{
			Key:        cacheKey,
			Value:      jsonBytes,
			Expiration: int32((1 * time.Hour).Seconds()),
		})
	}

	return response, nil
}

func (s *RateHandler) getProvinceIDByVillage(villageID string) (string, error) {
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

func (s *RateHandler) checkCrossIsland(originProvID, destProvID string) (bool, error) {
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

	if javaStatus[originProvID] != javaStatus[destProvID] {
		return true, nil
	}
	if !javaStatus[originProvID] && !javaStatus[destProvID] && (originProvID != destProvID) {
		return true, nil
	}

	return false, nil
}