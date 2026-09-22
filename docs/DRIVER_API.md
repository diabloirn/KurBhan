# KurBhan Driver API Documentation

## 1. Overview
The Driver API provides endpoints for drivers to view assigned jobs, accept jobs, update their real-time location, complete deliveries, and process Cash-On-Delivery (COD) payments. The API is implemented using gRPC in the `ShipmentService`.

## 2. Authentication
Drivers must authenticate using a JWT token.
- **Role required**: `driver`
- Ensure you have logged in via the Auth service and obtained a token. Send the token in the `authorization` header (e.g., `Bearer <token>`).

## 3. Workflow
```text
Login → Get assigned jobs → Accept job → Update location (periodic) → Complete delivery → Collect COD (if applicable)
```

## 4. Endpoints

### 4.1 GetDriverAssignedShipments
Fetches shipments assigned to the current driver.

- **Request**: `GetDriverShipmentsRequest`
  - `driver_id` (string): Driver's UUID
  - `status_filter` (string, optional): Filter by status (e.g., "PENDING")

- **Response**: `GetDriverShipmentsResponse`
  - `items` (repeated DriverShipmentItem): List of shipments
  - `total_count` (int32): Total number of items

- **Example Request JSON (if using grpc-gateway)**
  ```json
  {
    "driver_id": "d-1234",
    "status_filter": "PENDING"
  }
  ```

- **Error Codes**:
  - `InvalidArgument`: Missing `driver_id`
  - `Internal`: Database errors

### 4.2 AcceptShipmentJob
Driver accepts a pending job.

- **Request**: `AcceptJobRequest`
  - `shipment_id` (string): Shipment UUID
  - `driver_id` (string): Driver's UUID

- **Response**: `AcceptJobResponse`
  - `success` (bool)
  - `message` (string)
  - `tracking_number` (string)

- **Error Codes**:
  - `NotFound`: Shipment not found
  - `FailedPrecondition`: Shipment not PENDING
  - `AlreadyExists`: Already accepted by another driver

### 4.3 UpdateDriverLocation
Periodic location updates from the driver's app.

- **Request**: `UpdateLocationRequest`
  - `driver_id` (string)
  - `shipment_id` (string)
  - `latitude` (double)
  - `longitude` (double)

- **Response**: `UpdateLocationResponse`
  - `success` (bool)
  - `message` (string)

- **Error Codes**:
  - `InvalidArgument`: Missing ID
  - `NotFound`: Shipment/Driver mismatch

### 4.4 CompleteDelivery
Mark shipment as delivered with proof.

- **Request**: `CompleteDeliveryRequest`
  - `shipment_id` (string)
  - `driver_id` (string)
  - `proof_image_url` (string)
  - `recipient_name` (string)
  - `notes` (string)

- **Response**: `CompleteDeliveryResponse`
  - `success` (bool)
  - `message` (string)
  - `tracking_number` (string)
  - `completed_at` (string)

- **Error Codes**:
  - `PermissionDenied`: Not assigned to this driver
  - `NotFound`: Shipment not found

### 4.5 CollectCODPayment
Collect COD payments for pickups (DP) or deliveries (Remaining).

- **Request**: `CollectCODRequest`
  - `shipment_id` (string)
  - `driver_id` (string)
  - `amount_collected` (double)
  - `collection_type` (string): "DP_PICKUP" or "REMAINING_DELIVERY"

- **Response**: `CollectCODResponse`
  - `success` (bool)
  - `message` (string)
  - `total_collected` (double)
  - `remaining` (double)

- **Error Codes**:
  - `FailedPrecondition`: Not a COD payment
  - `InvalidArgument`: Insufficient amount or invalid type
