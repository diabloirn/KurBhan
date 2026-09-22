package handler

import (
	"math"
	"strings"
	"testing"
	"time"
)

// =========================================================================
// TDD SECURITY TEST SUITE: KurBhan Payment Service
// Memeriksa celah keamanan: Amount Tampering, Expiry Bypass, Phone Validation,
// Replay Attacks, dan Crosscheck Bukti Transfer Bank.
// =========================================================================

func TestCleanAndValidatePhoneNumber(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		expected    string
		expectError bool
	}{
		{"Standard 08xx", "081234567890", "81234567890", false},
		{"With Country Code +62", "+6281234567890", "81234567890", false},
		{"With Country Code 62", "6281234567890", "81234567890", false},
		{"With Dashes", "0812-3456-7890", "81234567890", false},
		{"With Spaces", "0812 3456 7890", "81234567890", false},
		{"Short Valid 10 digits", "0812345678", "812345678", false},
		{"Long Valid 13 digits", "0812345678901", "812345678901", false},
		{"Empty string", "", "", true},
		{"Too Short", "0812", "", true},
		{"Too Long", "08123456789012345", "", true},
		{"Contains Letters", "0812345abcd", "", true},
		{"SQL Injection Attempt", "' OR '1'='1", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := CleanAndValidatePhoneNumber(tt.input)
			if (err != nil) != tt.expectError {
				t.Fatalf("CleanAndValidatePhoneNumber(%q) error = %v, expectError %v", tt.input, err, tt.expectError)
			}
			if !tt.expectError && got != tt.expected {
				t.Errorf("CleanAndValidatePhoneNumber(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}

func TestGenerateVANumberWithPhone(t *testing.T) {
	phone := "081234567890"
	expectedCleanPhone := "81234567890"

	channels := []struct {
		channel        string
		expectedPrefix string
	}{
		{"BCA_VA", "39107"},
		{"BCA", "39107"},
		{"BLU_BCA", "00789"},
		{"BLU_VA", "00789"},
		{"MANDIRI_VA", "89508"},
		{"MANDIRI", "89508"},
		{"BNI_VA", "8241"},
		{"BNI", "8241"},
		{"BRI_VA", "88099"},
		{"BRI", "88099"},
	}

	for _, c := range channels {
		va, err := GenerateVANumber(c.channel, phone)
		if err != nil {
			t.Fatalf("GenerateVANumber(%q, %q) unexpected error: %v", c.channel, phone, err)
		}
		expectedVA := c.expectedPrefix + expectedCleanPhone
		if va != expectedVA {
			t.Errorf("GenerateVANumber(%q) = %q, want %q", c.channel, va, expectedVA)
		}
	}

	// Test invalid channel
	_, err := GenerateVANumber("INVALID_BANK", phone)
	if err == nil {
		t.Errorf("GenerateVANumber with invalid bank expected error, got nil")
	}

	// Test invalid phone
	_, err = GenerateVANumber("BCA_VA", "invalid-phone")
	if err == nil {
		t.Errorf("GenerateVANumber with invalid phone expected error, got nil")
	}
}

func TestSecurity_COD_Minimum50PercentDP(t *testing.T) {
	total := 100000.0

	tests := []struct {
		name        string
		dpAmount    float64
		expectValid bool
		expectedRem float64
	}{
		{"Exact 50% DP", 50000.0, true, 50000.0},
		{"70% DP", 70000.0, true, 30000.0},
		{"100% Full Payment", 100000.0, true, 0.0},
		{"Underpayment 49%", 49000.0, false, 0.0},
		{"Zero DP", 0.0, false, 0.0},
		{"Negative DP Tampering", -50000.0, false, 0.0},
		{"Overpayment > 100%", 150000.0, false, 0.0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rem, err := ValidateCODRequirements(total, tt.dpAmount)
			if (err == nil) != tt.expectValid {
				t.Errorf("ValidateCODRequirements(dp=%.0f) valid=%v, want %v (err=%v)", tt.dpAmount, err == nil, tt.expectValid, err)
			}
			if tt.expectValid && math.Abs(rem-tt.expectedRem) > 0.01 {
				t.Errorf("ValidateCODRequirements remaining=%.0f, want %.0f", rem, tt.expectedRem)
			}
		})
	}
}

func TestSecurity_VATransaction_AmountTampering(t *testing.T) {
	billAmount := 150000.0
	now := time.Now()
	expiry := now.Add(24 * time.Hour)

	tests := []struct {
		name              string
		transferredAmount float64
		expectedStatus    string
		expectSuccess     bool
	}{
		{"Exact Amount Match", 150000.0, "CONFIRMED", true},
		{"Underpayment 1 Rupiah", 149999.0, "REJECTED", false},
		{"Underpayment 10k", 140000.0, "REJECTED", false},
		{"Overpayment 1 Rupiah", 150001.0, "REJECTED", false},
		{"Zero Amount", 0.0, "REJECTED", false},
		{"Negative Amount Tampering", -150000.0, "REJECTED", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid, status, reason := ValidateVATransaction(billAmount, "PENDING", expiry, tt.transferredAmount, now)
			if isValid != tt.expectSuccess {
				t.Errorf("ValidateVATransaction(%s) isValid=%v, want %v (reason: %s)", tt.name, isValid, tt.expectSuccess, reason)
			}
			if status != tt.expectedStatus {
				t.Errorf("ValidateVATransaction(%s) status=%s, want %s", tt.name, status, tt.expectedStatus)
			}
		})
	}
}

func TestSecurity_VATransaction_Expiry24Hours(t *testing.T) {
	billAmount := 100000.0
	createdAt := time.Date(2026, 9, 21, 10, 0, 0, 0, time.UTC)
	expiry := createdAt.Add(24 * time.Hour) // Expiry is 2026-09-22 10:00:00

	tests := []struct {
		name           string
		paymentTime    time.Time
		expectedStatus string
		expectSuccess  bool
	}{
		{
			"Within 1 hour of creation",
			createdAt.Add(1 * time.Hour),
			"CONFIRMED",
			true,
		},
		{
			"Just before expiry (23h 59m)",
			expiry.Add(-1 * time.Minute),
			"CONFIRMED",
			true,
		},
		{
			"Just after expiry (24h 1m)",
			expiry.Add(1 * time.Minute),
			"EXPIRED",
			false,
		},
		{
			"Days after expiry (3 days later)",
			createdAt.Add(72 * time.Hour),
			"EXPIRED",
			false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid, status, reason := ValidateVATransaction(billAmount, "PENDING", expiry, billAmount, tt.paymentTime)
			if isValid != tt.expectSuccess {
				t.Errorf("ValidateVATransaction(%s) isValid=%v, want %v (reason: %s)", tt.name, isValid, tt.expectSuccess, reason)
			}
			if status != tt.expectedStatus {
				t.Errorf("ValidateVATransaction(%s) status=%s, want %s", tt.name, status, tt.expectedStatus)
			}
		})
	}
}

func TestSecurity_VATransaction_ReplayAttack_Idempotent(t *testing.T) {
	billAmount := 200000.0
	now := time.Now()
	expiry := now.Add(24 * time.Hour)

	// Call 1: Status PENDING -> Must be CONFIRMED
	valid1, status1, _ := ValidateVATransaction(billAmount, "PENDING", expiry, billAmount, now)
	if !valid1 || status1 != "CONFIRMED" {
		t.Fatalf("First transaction call failed: valid=%v, status=%s", valid1, status1)
	}

	// Call 2: Status already CONFIRMED -> Must remain idempotent without re-processing
	valid2, status2, reason2 := ValidateVATransaction(billAmount, "CONFIRMED", expiry, billAmount, now)
	if !valid2 || status2 != "CONFIRMED" {
		t.Errorf("Second call (idempotency) failed: valid=%v, status=%s, reason=%s", valid2, status2, reason2)
	}
	if !strings.Contains(reason2, "sudah diverifikasi") {
		t.Errorf("Expected idempotent reason, got: %s", reason2)
	}
}

func TestSecurity_BankTransfer_CrossCheck(t *testing.T) {
	billAmount := 250000.0
	now := time.Now()
	expiry := now.Add(24 * time.Hour)

	validSenderName := "Muhamad Nabhan"
	validSenderPhone := "081234567890"
	validProofURL := "https://storage.kurbhan.co.id/proofs/transfer_123.jpg"

	tests := []struct {
		name           string
		senderName     string
		senderPhone    string
		amount         float64
		proofURL       string
		paymentTime    time.Time
		expectSuccess  bool
		expectedStatus string
	}{
		{
			"All Valid Parameters",
			validSenderName,
			validSenderPhone,
			billAmount,
			validProofURL,
			now,
			true,
			"VERIFIED",
		},
		{
			"Missing Proof Image",
			validSenderName,
			validSenderPhone,
			billAmount,
			"",
			now,
			false,
			"REJECTED",
		},
		{
			"Empty Sender Name",
			"",
			validSenderPhone,
			billAmount,
			validProofURL,
			now,
			false,
			"REJECTED",
		},
		{
			"Too Short Sender Name",
			"A",
			validSenderPhone,
			billAmount,
			validProofURL,
			now,
			false,
			"REJECTED",
		},
		{
			"Invalid Sender Phone",
			validSenderName,
			"invalid-phone",
			billAmount,
			validProofURL,
			now,
			false,
			"REJECTED",
		},
		{
			"Amount Mismatch (Transfer Less)",
			validSenderName,
			validSenderPhone,
			200000.0,
			validProofURL,
			now,
			false,
			"REJECTED",
		},
		{
			"Payment After 24h Expiry",
			validSenderName,
			validSenderPhone,
			billAmount,
			validProofURL,
			expiry.Add(1 * time.Hour),
			false,
			"EXPIRED",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid, status, reason := CrossCheckBankTransfer(
				billAmount, "PENDING", expiry,
				tt.senderName, tt.senderPhone, tt.amount, tt.proofURL, tt.paymentTime,
			)
			if isValid != tt.expectSuccess {
				t.Errorf("CrossCheckBankTransfer(%s) isValid=%v, want %v (reason: %s)", tt.name, isValid, tt.expectSuccess, reason)
			}
			if status != tt.expectedStatus {
				t.Errorf("CrossCheckBankTransfer(%s) status=%s, want %s", tt.name, status, tt.expectedStatus)
			}
		})
	}
}

func TestGetBankAccountDetails(t *testing.T) {
	tests := []struct {
		channel         string
		expectedAccount string
		expectedName    string
	}{
		{"BCA", "8890123456", "PT KurBhan Logistik"},
		{"BLU_BCA", "0078901234", "PT KurBhan Logistik"},
		{"MANDIRI", "1270012345678", "PT KurBhan Logistik"},
		{"BNI", "0987654321", "PT KurBhan Logistik"},
		{"BRI", "034501000123456", "PT KurBhan Logistik"},
		{"INVALID", "", ""},
	}

	for _, test := range tests {
		account, name := GetBankAccountDetails(test.channel)
		if account != test.expectedAccount {
			t.Errorf("GetBankAccountDetails(%s) expected account %s, got %s", test.channel, test.expectedAccount, account)
		}
		if name != test.expectedName {
			t.Errorf("GetBankAccountDetails(%s) expected name %s, got %s", test.channel, test.expectedName, name)
		}
	}
}
