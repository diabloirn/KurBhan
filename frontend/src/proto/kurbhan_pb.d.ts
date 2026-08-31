import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"


export class RegisterRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: RegisterRequest.AsObject);
  getEmail(): string;
  setEmail(value: string): RegisterRequest;

  getPassword(): string;
  setPassword(value: string): RegisterRequest;

  getFullName(): string;
  setFullName(value: string): RegisterRequest;

  getPhoneNumber(): string;
  setPhoneNumber(value: string): RegisterRequest;

  getRole(): string;
  setRole(value: string): RegisterRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterRequest): RegisterRequest.AsObject;
  static serializeBinaryToWriter(message: RegisterRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterRequest;
  static deserializeBinaryFromReader(message: RegisterRequest, reader: jspb.BinaryReader): RegisterRequest;
}

export namespace RegisterRequest {
  export type AsObject = {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role: string;
  };
}

export class LoginRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: LoginRequest.AsObject);
  getEmail(): string;
  setEmail(value: string): LoginRequest;

  getPassword(): string;
  setPassword(value: string): LoginRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LoginRequest): LoginRequest.AsObject;
  static serializeBinaryToWriter(message: LoginRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginRequest;
  static deserializeBinaryFromReader(message: LoginRequest, reader: jspb.BinaryReader): LoginRequest;
}

export namespace LoginRequest {
  export type AsObject = {
    email: string;
    password: string;
  };
}

export class UserProto extends jspb.Message {
  constructor();
  constructor(opt_data?: UserProto.AsObject);
  getId(): string;
  setId(value: string): UserProto;

  getFullName(): string;
  setFullName(value: string): UserProto;

  getEmail(): string;
  setEmail(value: string): UserProto;

  getRole(): string;
  setRole(value: string): UserProto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserProto.AsObject;
  static toObject(includeInstance: boolean, msg: UserProto): UserProto.AsObject;
  static serializeBinaryToWriter(message: UserProto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserProto;
  static deserializeBinaryFromReader(message: UserProto, reader: jspb.BinaryReader): UserProto;
}

export namespace UserProto {
  export type AsObject = {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export class LoginResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: LoginResponse.AsObject);
  getToken(): string;
  setToken(value: string): LoginResponse;

  getUser(): UserProto | undefined;
  setUser(value?: UserProto): LoginResponse;
  hasUser(): boolean;
  clearUser(): LoginResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LoginResponse): LoginResponse.AsObject;
  static serializeBinaryToWriter(message: LoginResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginResponse;
  static deserializeBinaryFromReader(message: LoginResponse, reader: jspb.BinaryReader): LoginResponse;
}

export namespace LoginResponse {
  export type AsObject = {
    token: string;
    user?: UserProto.AsObject;
  };
}

export class RegisterResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: RegisterResponse.AsObject);
  getUserId(): string;
  setUserId(value: string): RegisterResponse;

  getMessage(): string;
  setMessage(value: string): RegisterResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterResponse): RegisterResponse.AsObject;
  static serializeBinaryToWriter(message: RegisterResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterResponse;
  static deserializeBinaryFromReader(message: RegisterResponse, reader: jspb.BinaryReader): RegisterResponse;
}

export namespace RegisterResponse {
  export type AsObject = {
    userId: string;
    message: string;
  };
}

export class AuthResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: AuthResponse.AsObject);
  getToken(): string;
  setToken(value: string): AuthResponse;

  getUserId(): string;
  setUserId(value: string): AuthResponse;

  getRole(): string;
  setRole(value: string): AuthResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AuthResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AuthResponse): AuthResponse.AsObject;
  static serializeBinaryToWriter(message: AuthResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AuthResponse;
  static deserializeBinaryFromReader(message: AuthResponse, reader: jspb.BinaryReader): AuthResponse;
}

export namespace AuthResponse {
  export type AsObject = {
    token: string;
    userId: string;
    role: string;
  };
}

export class CalculateRateRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: CalculateRateRequest.AsObject);
  getOriginVillageId(): string;
  setOriginVillageId(value: string): CalculateRateRequest;

  getDestinationVillageId(): string;
  setDestinationVillageId(value: string): CalculateRateRequest;

  getActualWeightKg(): number;
  setActualWeightKg(value: number): CalculateRateRequest;

  getLengthCm(): number;
  setLengthCm(value: number): CalculateRateRequest;

  getWidthCm(): number;
  setWidthCm(value: number): CalculateRateRequest;

  getHeightCm(): number;
  setHeightCm(value: number): CalculateRateRequest;

  getVehicleType(): string;
  setVehicleType(value: string): CalculateRateRequest;

  getServiceType(): string;
  setServiceType(value: string): CalculateRateRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CalculateRateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CalculateRateRequest): CalculateRateRequest.AsObject;
  static serializeBinaryToWriter(message: CalculateRateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CalculateRateRequest;
  static deserializeBinaryFromReader(message: CalculateRateRequest, reader: jspb.BinaryReader): CalculateRateRequest;
}

export namespace CalculateRateRequest {
  export type AsObject = {
    originVillageId: string;
    destinationVillageId: string;
    actualWeightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    vehicleType: string;
    serviceType: string;
  };
}

export class CalculateRateResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: CalculateRateResponse.AsObject);
  getVolumetricWeightKg(): number;
  setVolumetricWeightKg(value: number): CalculateRateResponse;

  getChargeableWeightKg(): number;
  setChargeableWeightKg(value: number): CalculateRateResponse;

  getTotalPrice(): number;
  setTotalPrice(value: number): CalculateRateResponse;

  getIsCrossIsland(): boolean;
  setIsCrossIsland(value: boolean): CalculateRateResponse;

  getEstimatedMinDays(): string;
  setEstimatedMinDays(value: string): CalculateRateResponse;

  getEstimatedMaxDays(): string;
  setEstimatedMaxDays(value: string): CalculateRateResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CalculateRateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CalculateRateResponse): CalculateRateResponse.AsObject;
  static serializeBinaryToWriter(message: CalculateRateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CalculateRateResponse;
  static deserializeBinaryFromReader(message: CalculateRateResponse, reader: jspb.BinaryReader): CalculateRateResponse;
}

export namespace CalculateRateResponse {
  export type AsObject = {
    volumetricWeightKg: number;
    chargeableWeightKg: number;
    totalPrice: number;
    isCrossIsland: boolean;
    estimatedMinDays: string;
    estimatedMaxDays: string;
  };
}

export class CreateShipmentRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: CreateShipmentRequest.AsObject);
  getUserId(): string;
  setUserId(value: string): CreateShipmentRequest;

  getSenderName(): string;
  setSenderName(value: string): CreateShipmentRequest;

  getSenderAddress(): string;
  setSenderAddress(value: string): CreateShipmentRequest;

  getSenderPhone(): string;
  setSenderPhone(value: string): CreateShipmentRequest;

  getReceiverName(): string;
  setReceiverName(value: string): CreateShipmentRequest;

  getReceiverAddress(): string;
  setReceiverAddress(value: string): CreateShipmentRequest;

  getReceiverPhone(): string;
  setReceiverPhone(value: string): CreateShipmentRequest;

  getOriginVillageId(): string;
  setOriginVillageId(value: string): CreateShipmentRequest;

  getDestinationVillageId(): string;
  setDestinationVillageId(value: string): CreateShipmentRequest;

  getWeightKg(): number;
  setWeightKg(value: number): CreateShipmentRequest;

  getServiceType(): string;
  setServiceType(value: string): CreateShipmentRequest;

  getTotalCost(): number;
  setTotalCost(value: number): CreateShipmentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateShipmentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateShipmentRequest): CreateShipmentRequest.AsObject;
  static serializeBinaryToWriter(message: CreateShipmentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateShipmentRequest;
  static deserializeBinaryFromReader(message: CreateShipmentRequest, reader: jspb.BinaryReader): CreateShipmentRequest;
}

export namespace CreateShipmentRequest {
  export type AsObject = {
    userId: string;
    senderName: string;
    senderAddress: string;
    senderPhone: string;
    receiverName: string;
    receiverAddress: string;
    receiverPhone: string;
    originVillageId: string;
    destinationVillageId: string;
    weightKg: number;
    serviceType: string;
    totalCost: number;
  };
}

export class CreateShipmentResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: CreateShipmentResponse.AsObject);
  getShipmentId(): string;
  setShipmentId(value: string): CreateShipmentResponse;

  getTrackingNumber(): string;
  setTrackingNumber(value: string): CreateShipmentResponse;

  getStatus(): string;
  setStatus(value: string): CreateShipmentResponse;

  getMessage(): string;
  setMessage(value: string): CreateShipmentResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateShipmentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateShipmentResponse): CreateShipmentResponse.AsObject;
  static serializeBinaryToWriter(message: CreateShipmentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateShipmentResponse;
  static deserializeBinaryFromReader(message: CreateShipmentResponse, reader: jspb.BinaryReader): CreateShipmentResponse;
}

export namespace CreateShipmentResponse {
  export type AsObject = {
    shipmentId: string;
    trackingNumber: string;
    status: string;
    message: string;
  };
}

export class UpdateShipmentStatusRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: UpdateShipmentStatusRequest.AsObject);
  getTrackingNumber(): string;
  setTrackingNumber(value: string): UpdateShipmentStatusRequest;

  getStatus(): string;
  setStatus(value: string): UpdateShipmentStatusRequest;

  getLocation(): string;
  setLocation(value: string): UpdateShipmentStatusRequest;

  getDescription(): string;
  setDescription(value: string): UpdateShipmentStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateShipmentStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateShipmentStatusRequest): UpdateShipmentStatusRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateShipmentStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateShipmentStatusRequest;
  static deserializeBinaryFromReader(message: UpdateShipmentStatusRequest, reader: jspb.BinaryReader): UpdateShipmentStatusRequest;
}

export namespace UpdateShipmentStatusRequest {
  export type AsObject = {
    trackingNumber: string;
    status: string;
    location: string;
    description: string;
  };
}

export class UpdateShipmentStatusResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: UpdateShipmentStatusResponse.AsObject);
  getShipmentId(): string;
  setShipmentId(value: string): UpdateShipmentStatusResponse;

  getTrackingNumber(): string;
  setTrackingNumber(value: string): UpdateShipmentStatusResponse;

  getStatus(): string;
  setStatus(value: string): UpdateShipmentStatusResponse;

  getMessage(): string;
  setMessage(value: string): UpdateShipmentStatusResponse;

  getSuccess(): boolean;
  setSuccess(value: boolean): UpdateShipmentStatusResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateShipmentStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateShipmentStatusResponse): UpdateShipmentStatusResponse.AsObject;
  static serializeBinaryToWriter(message: UpdateShipmentStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateShipmentStatusResponse;
  static deserializeBinaryFromReader(message: UpdateShipmentStatusResponse, reader: jspb.BinaryReader): UpdateShipmentStatusResponse;
}

export namespace UpdateShipmentStatusResponse {
  export type AsObject = {
    shipmentId: string;
    trackingNumber: string;
    status: string;
    message: string;
    success: boolean;
  };
}

export class CancelShipmentRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: CancelShipmentRequest.AsObject);
  getShipmentId(): string;
  setShipmentId(value: string): CancelShipmentRequest;

  getUserId(): string;
  setUserId(value: string): CancelShipmentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelShipmentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CancelShipmentRequest): CancelShipmentRequest.AsObject;
  static serializeBinaryToWriter(message: CancelShipmentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelShipmentRequest;
  static deserializeBinaryFromReader(message: CancelShipmentRequest, reader: jspb.BinaryReader): CancelShipmentRequest;
}

export namespace CancelShipmentRequest {
  export type AsObject = {
    shipmentId: string;
    userId: string;
  };
}

export class ShipmentProto extends jspb.Message {
  constructor();
  constructor(opt_data?: ShipmentProto.AsObject);
  getId(): string;
  setId(value: string): ShipmentProto;

  getTrackingNumber(): string;
  setTrackingNumber(value: string): ShipmentProto;

  getSenderName(): string;
  setSenderName(value: string): ShipmentProto;

  getSenderAddress(): string;
  setSenderAddress(value: string): ShipmentProto;

  getReceiverName(): string;
  setReceiverName(value: string): ShipmentProto;

  getReceiverAddress(): string;
  setReceiverAddress(value: string): ShipmentProto;

  getWeightKg(): number;
  setWeightKg(value: number): ShipmentProto;

  getServiceType(): string;
  setServiceType(value: string): ShipmentProto;

  getTotalCost(): number;
  setTotalCost(value: number): ShipmentProto;

  getStatus(): string;
  setStatus(value: string): ShipmentProto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShipmentProto.AsObject;
  static toObject(includeInstance: boolean, msg: ShipmentProto): ShipmentProto.AsObject;
  static serializeBinaryToWriter(message: ShipmentProto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShipmentProto;
  static deserializeBinaryFromReader(message: ShipmentProto, reader: jspb.BinaryReader): ShipmentProto;
}

export namespace ShipmentProto {
  export type AsObject = {
    id: string;
    trackingNumber: string;
    senderName: string;
    senderAddress: string;
    receiverName: string;
    receiverAddress: string;
    weightKg: number;
    serviceType: string;
    totalCost: number;
    status: string;
  };
}

export class TrackingHistoryProto extends jspb.Message {
  constructor();
  constructor(opt_data?: TrackingHistoryProto.AsObject);
  getStatus(): string;
  setStatus(value: string): TrackingHistoryProto;

  getDescription(): string;
  setDescription(value: string): TrackingHistoryProto;

  getLocation(): string;
  setLocation(value: string): TrackingHistoryProto;

  getTimestamp(): string;
  setTimestamp(value: string): TrackingHistoryProto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackingHistoryProto.AsObject;
  static toObject(includeInstance: boolean, msg: TrackingHistoryProto): TrackingHistoryProto.AsObject;
  static serializeBinaryToWriter(message: TrackingHistoryProto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackingHistoryProto;
  static deserializeBinaryFromReader(message: TrackingHistoryProto, reader: jspb.BinaryReader): TrackingHistoryProto;
}

export namespace TrackingHistoryProto {
  export type AsObject = {
    status: string;
    description: string;
    location: string;
    timestamp: string;
  };
}

export class TrackShipmentRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: TrackShipmentRequest.AsObject);
  getTrackingNumber(): string;
  setTrackingNumber(value: string): TrackShipmentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackShipmentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TrackShipmentRequest): TrackShipmentRequest.AsObject;
  static serializeBinaryToWriter(message: TrackShipmentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackShipmentRequest;
  static deserializeBinaryFromReader(message: TrackShipmentRequest, reader: jspb.BinaryReader): TrackShipmentRequest;
}

export namespace TrackShipmentRequest {
  export type AsObject = {
    trackingNumber: string;
  };
}

export class TrackShipmentResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: TrackShipmentResponse.AsObject);
  getShipment(): ShipmentProto | undefined;
  setShipment(value?: ShipmentProto): TrackShipmentResponse;
  hasShipment(): boolean;
  clearShipment(): TrackShipmentResponse;

  getHistoriesList(): Array<TrackingHistoryProto>;
  setHistoriesList(value: Array<TrackingHistoryProto>): TrackShipmentResponse;
  clearHistoriesList(): TrackShipmentResponse;
  addHistories(value?: TrackingHistoryProto, index?: number): TrackingHistoryProto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackShipmentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TrackShipmentResponse): TrackShipmentResponse.AsObject;
  static serializeBinaryToWriter(message: TrackShipmentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackShipmentResponse;
  static deserializeBinaryFromReader(message: TrackShipmentResponse, reader: jspb.BinaryReader): TrackShipmentResponse;
}

export namespace TrackShipmentResponse {
  export type AsObject = {
    shipment?: ShipmentProto.AsObject;
    historiesList: Array<TrackingHistoryProto.AsObject>;
  };
}

export class ShipmentResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: ShipmentResponse.AsObject);
  getShipmentId(): string;
  setShipmentId(value: string): ShipmentResponse;

  getStatus(): string;
  setStatus(value: string): ShipmentResponse;

  getTotalPrice(): number;
  setTotalPrice(value: number): ShipmentResponse;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): ShipmentResponse;
  hasCreatedAt(): boolean;
  clearCreatedAt(): ShipmentResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShipmentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ShipmentResponse): ShipmentResponse.AsObject;
  static serializeBinaryToWriter(message: ShipmentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShipmentResponse;
  static deserializeBinaryFromReader(message: ShipmentResponse, reader: jspb.BinaryReader): ShipmentResponse;
}

export namespace ShipmentResponse {
  export type AsObject = {
    shipmentId: string;
    status: string;
    totalPrice: number;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

