package scraper

import (
	"math/rand"
	"time"
)

type SiCepatScraper struct{}

func NewSiCepatScraper() *SiCepatScraper {
	return &SiCepatScraper{}
}

func (s *SiCepatScraper) Name() string {
	return "SiCepat"
}

func (s *SiCepatScraper) ScrapeRates(origin, destination string, weightKg float64) ([]RateResult, error) {
	time.Sleep(100 * time.Millisecond)

	baseRate := 10000.0 * weightKg
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	multiplier := 1.10 + r.Float64()*0.20

	return []RateResult{
		{
			Competitor:      s.Name(),
			OriginCity:      origin,
			DestinationCity: destination,
			WeightKg:        weightKg,
			ServiceType:     "SIUNT",
			Price:           baseRate * multiplier,
			ETDDays:         "1-3",
		},
	}, nil
}
