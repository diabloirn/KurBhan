package handler

import (
	"testing"
)

func TestValidateAcceptJob(t *testing.T) {
	err := ValidateAcceptJob("", "ship1")
	if err == nil {
		t.Errorf("Diharapkan error karena driver_id kosong")
	}

	err = ValidateAcceptJob("driver1", "")
	if err == nil {
		t.Errorf("Diharapkan error karena shipment_id kosong")
	}

	err = ValidateAcceptJob("driver1", "ship1")
	if err != nil {
		t.Errorf("Diharapkan sukses, tapi dapat: %v", err)
	}
}

func TestValidateCompleteDelivery(t *testing.T) {
	err := ValidateCompleteDelivery("", "ship1")
	if err == nil {
		t.Errorf("Diharapkan error karena driver_id kosong")
	}

	err = ValidateCompleteDelivery("drv1", "ship1")
	if err != nil {
		t.Errorf("Diharapkan sukses, tapi dapat error: %v", err)
	}
}

func TestValidateCODAmount(t *testing.T) {
	err := ValidateCODAmount(50000, 100000)
	if err == nil {
		t.Errorf("Diharapkan error karena jumlah kurang")
	}

	err = ValidateCODAmount(100000, 100000)
	if err != nil {
		t.Errorf("Diharapkan sukses, tapi dapat: %v", err)
	}
}
