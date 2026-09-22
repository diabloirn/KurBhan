package scraper

import (
	"math/rand"
	"time"
)

type JNEScraper struct{}

func NewJNEScraper() *JNEScraper {
	return &JNEScraper{}
}

func (s *JNEScraper) Name() string {
	return "JNE"
}

func (s *JNEScraper) ScrapeRates(origin, destination string, weightKg float64) ([]RateResult, error) {
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
			ServiceType:     "REG",
			Price:           baseRate * multiplier,
			ETDDays:         "2-3",
		},
		{
			Competitor:      s.Name(),
			OriginCity:      origin,
			DestinationCity: destination,
			WeightKg:        weightKg,
			ServiceType:     "YES",
			Price:           (baseRate * 1.5) * multiplier,
			ETDDays:         "1",
		},
	}, nil
}
