# Protobuf generation instructions

To generate the protobuf stubs, run the following command from the root of the project:

```bash
protoc --go_out=./backend/internal/services/payment_service/pb --go_opt=paths=source_relative \
       --go-grpc_out=./backend/internal/services/payment_service/pb --go-grpc_opt=paths=source_relative \
       -I ./proto ./proto/kurbhan.proto
```

The `handler` package relies on the generated structures to compile.
