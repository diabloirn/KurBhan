package handler

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "payment-service/pb"
)

// CleanAndValidatePhoneNumber membersihkan format nomor telepon Indonesia (+62, 62, 08xx, spasi, dash)
// dan mengembalikan nomor dalam format standar '8xxxxxxxx' (tanpa leading 0 / 62).
func CleanAndValidatePhoneNumber(rawPhone string) (string, error) {
	if rawPhone == "" {
		return "", errors.New("nomor telepon tidak boleh kosong")
	}

	// Hapus semua spasi, dash, kurung, dan tanda plus
	cleaned := strings.ReplaceAll(rawPhone, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")
	cleaned = strings.TrimPrefix(cleaned, "+")

	// Deteksi upaya SQL Injection atau karakter non-angka
	isNumeric := regexp.MustCompile(`^[0-9]+$`).MatchString(cleaned)
	if !isNumeric {
		return "", errors.New("nomor telepon hanya boleh berisi angka")
	}

	// Standarisasi: ubah 628xx atau 08xx menjadi 8xx
	if strings.HasPrefix(cleaned, "628") {
		cleaned = strings.TrimPrefix(cleaned, "62")
	} else if strings.HasPrefix(cleaned, "08") {
		cleaned = strings.TrimPrefix(cleaned, "0")
	}

	// Validasi panjang nomor telepon seluler Indonesia (standar: 9 - 13 digit setelah angka 8)
	if len(cleaned) < 9 || len(cleaned) > 13 || !strings.HasPrefix(cleaned, "8") {
		return "", fmt.Errorf("panjang nomor telepon tidak valid: %d digit (harus 9-13 digit diawali angka 8)", len(cleaned))
	}

	return cleaned, nil
}

// GenerateVANumber menghasilkan nomor Virtual Account resmi berdasarkan channel bank
// yang digabungkan dengan nomor telepon pelanggan (Prefix Bank + Clean Phone).
func GenerateVANumber(channel string, customerPhone string) (string, error) {
	cleanPhone, err := CleanAndValidatePhoneNumber(customerPhone)
	if err != nil {
		return "", fmt.Errorf("gagal generate nomor VA: %w", err)
	}

	prefix := ""
	switch channel {
	case "BCA_VA", "BCA":
		prefix = "39107" // Prefix resmi BCA VA
	case "BLU_BCA", "BLU_VA":
		prefix = "00789" // Prefix resmi BLU by BCA VA
	case "MANDIRI_VA", "MANDIRI":
		prefix = "89508" // Prefix resmi Mandiri VA
	case "BNI_VA", "BNI":
		prefix = "8241" // Prefix resmi BNI VA
	case "BRI_VA", "BRI":
		prefix = "88099" // Prefix resmi BRI BRIVA
	default:
		return "", fmt.Errorf("channel bank Virtual Account %q tidak didukung", channel)
	}

	return prefix + cleanPhone, nil
}

// GetBankAccountDetails mengembalikan nomor rekening dan atas nama rekening resmi KurBhan
// untuk metode transfer manual.
func GetBankAccountDetails(channel string) (string, string) {
	switch channel {
	case "BCA":
		return "8890123456", "PT KurBhan Logistik"
	case "BLU_BCA":
		return "0078901234", "PT KurBhan Logistik"
	case "MANDIRI":
		return "1270012345678", "PT KurBhan Logistik"
	case "BNI":
		return "0987654321", "PT KurBhan Logistik"
	case "BRI":
		return "034501000123456", "PT KurBhan Logistik"
	default:
		return "", ""
	}
}

// ValidateCODRequirements memvalidasi kepatuhan aturan Cash on Delivery KurBhan:
// Pengirim wajib membayar Down Payment (DP) minimal 50% saat penjemputan barang.
func ValidateCODRequirements(totalAmount float64, dpAmount float64) (float64, error) {
	if totalAmount <= 0 {
		return 0, errors.New("total tagihan harus lebih besar dari 0")
	}
	if dpAmount <= 0 {
		return 0, errors.New("uang muka (DP) COD wajib diisi dan lebih besar dari 0")
	}

	minDP := totalAmount * 0.50
	if dpAmount < minDP {
		return 0, fmt.Errorf("uang muka (DP) COD minimal 50%% dari total tagihan (minimal Rp %.0f)", minDP)
	}
	if dpAmount > totalAmount {
		return 0, errors.New("uang muka (DP) COD tidak boleh melebihi total tagihan")
	}

	remaining := totalAmount - dpAmount
	return remaining, nil
}

// CreatePayment menangani inisialisasi pembayaran untuk pengiriman KurBhan.
func (h *PaymentHandler) CreatePayment(ctx context.Context, req *pb.CreatePaymentRequest) (*pb.CreatePaymentResponse, error) {
	if req.ShipmentId == "" || req.UserId == "" || req.Method == "" || req.Amount <= 0 {
		return nil, status.Error(codes.InvalidArgument, "Parameter pembayaran tidak lengkap")
	}

	var dpAmount float64 = 0
	var remainingAmount float64 = req.Amount
	var vaNumber string = ""
	var bankAccount string = ""
	var bankName string = ""

	switch req.Method {
	case "COD":
		rem, err := ValidateCODRequirements(req.Amount, req.CodDpAmount)
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, err.Error())
		}
		dpAmount = req.CodDpAmount
		remainingAmount = rem

	case "VIRTUAL_ACCOUNT":
		if req.CustomerPhone == "" {
			return nil, status.Error(codes.InvalidArgument, "Nomor telepon pelanggan wajib disertakan untuk Virtual Account")
		}
		generatedVA, err := GenerateVANumber(req.Channel, req.CustomerPhone)
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "Validasi VA gagal: %v", err)
		}
		vaNumber = generatedVA

	case "BANK_TRANSFER":
		acc, name := GetBankAccountDetails(req.Channel)
		if acc == "" {
			return nil, status.Errorf(codes.InvalidArgument, "Channel bank transfer %q tidak valid", req.Channel)
		}
		bankAccount = acc
		bankName = name

	default:
		return nil, status.Errorf(codes.InvalidArgument, "Metode pembayaran %q tidak valid (gunakan: BANK_TRANSFER, VIRTUAL_ACCOUNT, atau COD)", req.Method)
	}

	// Batas waktu pembayaran maksimal 1x24 jam
	expiredAt := time.Now().Add(24 * time.Hour)
	paymentID := uuid.New().String()

	query := `
		INSERT INTO payments (
			id, shipment_id, user_id, method, channel, amount, dp_amount, remaining_amount,
			va_number, customer_phone, customer_name, bank_account_number, bank_account_name,
			status, expired_at, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING', $14, NOW(), NOW())
	`

	_, err := h.DB.ExecContext(ctx, query,
		paymentID, req.ShipmentId, req.UserId, req.Method, req.Channel,
		req.Amount, dpAmount, remainingAmount,
		vaNumber, req.CustomerPhone, req.CustomerName, bankAccount, bankName,
		expiredAt,
	)

	if err != nil {
		return nil, status.Errorf(codes.Internal, "Gagal menyimpan data pembayaran: %v", err)
	}

	return &pb.CreatePaymentResponse{
		PaymentId:         paymentID,
		Method:            req.Method,
		Channel:           req.Channel,
		Amount:            req.Amount,
		DpAmount:          dpAmount,
		RemainingAmount:   remainingAmount,
		VaNumber:          vaNumber,
		BankAccountNumber: bankAccount,
		BankAccountName:   bankName,
		Status:            "PENDING",
		ExpiredAt:         expiredAt.Format(time.RFC3339),
		Message:           "Instruksi pembayaran berhasil dibuat (Batas waktu: 1x24 jam)",
	}, nil
}
