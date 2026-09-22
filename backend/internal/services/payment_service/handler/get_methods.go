package handler

import (
	"context"
	pb "payment-service/pb"
)

func (h *PaymentHandler) GetPaymentMethods(ctx context.Context, req *pb.GetPaymentMethodsRequest) (*pb.GetPaymentMethodsResponse, error) {
	methods := []*pb.PaymentMethodInfo{
		{
			Method:            "BANK_TRANSFER",
			Channel:           "BCA",
			DisplayName:       "Transfer Bank BCA",
			BankAccountNumber: "8890123456",
			BankAccountName:   "PT KurBhan Logistik",
			IsActive:          true,
		},
		{
			Method:            "BANK_TRANSFER",
			Channel:           "MANDIRI",
			DisplayName:       "Transfer Bank Mandiri",
			BankAccountNumber: "1270012345678",
			BankAccountName:   "PT KurBhan Logistik",
			IsActive:          true,
		},
		{
			Method:            "BANK_TRANSFER",
			Channel:           "BNI",
			DisplayName:       "Transfer Bank BNI",
			BankAccountNumber: "0987654321",
			BankAccountName:   "PT KurBhan Logistik",
			IsActive:          true,
		},
		{
			Method:            "BANK_TRANSFER",
			Channel:           "BRI",
			DisplayName:       "Transfer Bank BRI",
			BankAccountNumber: "034501000123456",
			BankAccountName:   "PT KurBhan Logistik",
			IsActive:          true,
		},
		{
			Method:            "VIRTUAL_ACCOUNT",
			Channel:           "BCA_VA",
			DisplayName:       "BCA Virtual Account",
			IsActive:          true,
		},
		{
			Method:            "VIRTUAL_ACCOUNT",
			Channel:           "MANDIRI_VA",
			DisplayName:       "Mandiri Virtual Account",
			IsActive:          true,
		},
		{
			Method:            "VIRTUAL_ACCOUNT",
			Channel:           "BNI_VA",
			DisplayName:       "BNI Virtual Account",
			IsActive:          true,
		},
		{
			Method:            "VIRTUAL_ACCOUNT",
			Channel:           "BRI_VA",
			DisplayName:       "BRI Virtual Account",
			IsActive:          true,
		},
		{
			Method:            "COD",
			Channel:           "COD",
			DisplayName:       "Cash On Delivery (Bayar di Tempat)",
			IsActive:          true,
		},
	}

	return &pb.GetPaymentMethodsResponse{
		Methods: methods,
	}, nil
}
