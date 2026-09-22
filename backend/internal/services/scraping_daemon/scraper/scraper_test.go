package scraper

import (
	"testing"
)

func TestJNEScraper_Name(t *testing.T) {
	s := NewJNEScraper()
	if s.Name() != "JNE" {
		t.Errorf("Expected JNE, got %s", s.Name())
	}
}

func TestJNTScraper_Name(t *testing.T) {
	s := NewJNTScraper()
	if s.Name() != "J&T" {
		t.Errorf("Expected J&T, got %s", s.Name())
	}
}

func TestSiCepatScraper_Name(t *testing.T) {
	s := NewSiCepatScraper()
	if s.Name() != "SiCepat" {
		t.Errorf("Expected SiCepat, got %s", s.Name())
	}
}

func TestSimulatedScraping_GeneratesValidRates(t *testing.T) {
	s := NewJNEScraper()
	rates, err := s.ScrapeRates("Jakarta", "Bandung", 1.0)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}
	if len(rates) == 0 {
		t.Fatal("Expected rates, got 0")
	}

	for _, r := range rates {
		if r.Price <= 0 {
			t.Errorf("Invalid price: %f", r.Price)
		}
	}
}

func TestSimulatedScraping_RatesWithinRange(t *testing.T) {
	s := NewJNTScraper()
	weight := 1.0
	baseRate := 10000.0 * weight
	rates, _ := s.ScrapeRates("Jakarta", "Bandung", weight)

	for _, r := range rates {
		if r.ServiceType == "EZ" {
			minPrice := baseRate * 1.10
			maxPrice := baseRate * 1.30
			if r.Price < minPrice || r.Price > maxPrice {
				t.Errorf("Price %f out of expected range [%f, %f]", r.Price, minPrice, maxPrice)
			}
		}
	}
}
