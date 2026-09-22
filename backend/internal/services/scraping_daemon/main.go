package main

import (
	"database/sql"
	"log"
	"os"
	"time"

	"scraping-daemon/scraper"
	"scraping-daemon/store"

	_ "github.com/lib/pq"
)

func main() {
	dbURI := os.Getenv("DB_URI")
	if dbURI == "" {
		log.Fatal("DB_URI environment variable is not set")
	}

	db, err := sql.Open("postgres", dbURI)
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}
	defer db.Close()

	scrapers := []scraper.Scraper{
		scraper.NewJNEScraper(),
		scraper.NewJNTScraper(),
		scraper.NewSiCepatScraper(),
	}

	log.Println("Memulai Scraping Daemon...")
	runScraping(db, scrapers)

	ticker := time.NewTicker(6 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		log.Println("Menjalankan jadwal scraping...")
		runScraping(db, scrapers)
	}
}

func runScraping(db *sql.DB, scrapers []scraper.Scraper) {
	origins := []string{"Jakarta", "Bandung", "Surabaya"}
	destinations := []string{"Semarang", "Yogyakarta", "Malang"}
	weights := []float64{1.0, 5.0}

	for _, s := range scrapers {
		log.Printf("Menjalankan scraper %s...", s.Name())
		for _, origin := range origins {
			for _, destination := range destinations {
				for _, weight := range weights {
					rates, err := s.ScrapeRates(origin, destination, weight)
					if err != nil {
						log.Printf("Peringatan: Gagal mendapatkan tarif dari %s: %v", s.Name(), err)
						continue
					}

					if len(rates) > 0 {
						if err := store.SaveCompetitorRates(db, rates); err != nil {
							log.Printf("Gagal menyimpan hasil scraper %s: %v", s.Name(), err)
						}
					}
				}
			}
		}
	}
	log.Println("Scraping selesai.")
}
