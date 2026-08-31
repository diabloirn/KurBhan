# Build Stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o shipment-service main.go

# Runtime Stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/shipment-service .

EXPOSE 50053

CMD ["./shipment-service"]