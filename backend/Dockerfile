# Stage 1: Build binary
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy seluruh source code backend
COPY . .

# Compile binary Go untuk arsitektur Linux
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server/main.go

# Stage 2: Runtime image yang sangat ringan (Scratch/Alpine)
FROM alpine:latest

WORKDIR /app

# Install ca-certificates untuk SSL/TLS koneksi Supabase
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/main .

EXPOSE 50051

CMD ["./main"]