package scraper

type RateResult struct {
	Competitor      string
	OriginCity      string
	DestinationCity string
	WeightKg        float64
	ServiceType     string
	Price           float64
	ETDDays         string
}

type Scraper interface {
	Name() string
	ScrapeRates(origin, destination string, weightKg float64) ([]RateResult, error)
}
