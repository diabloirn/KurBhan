package scraper

import (
	"math/rand"
	"time"
)

type JNTScraper struct{}

func NewJNTScraper() *JNTScraper {
	return &JNTScraper{}
}

func (s *JNTScraper) Name() string {
	return "J&T"
}

func (s *JNTScraper) ScrapeRates(origin, destination string, weightKg float64) ([]RateResult, error) {
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
			ServiceType:     "EZ",
			Price:           baseRate * multiplier,
			ETDDays:         "2-3",
		},
	}, nil
}
