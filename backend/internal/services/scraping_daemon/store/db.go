package store

import (
	"database/sql"
	"scraping-daemon/scraper"
	"time"

	"github.com/google/uuid"
)

func SaveCompetitorRates(db *sql.DB, rates []scraper.RateResult) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT INTO competitor_rates (id, competitor_name, origin_city, destination_city, weight_kg, service_type, price, etd_days, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	now := time.Now()
	for _, r := range rates {
		id := uuid.New().String()
		_, err := stmt.Exec(id, r.Competitor, r.OriginCity, r.DestinationCity, r.WeightKg, r.ServiceType, r.Price, r.ETDDays, now)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
