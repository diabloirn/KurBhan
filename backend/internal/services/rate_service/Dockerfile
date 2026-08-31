# Build Stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o rate-service main.go

# Runtime Stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/rate-service .

EXPOSE 50052

CMD ["./rate-service"]