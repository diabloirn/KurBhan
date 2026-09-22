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

export class CreatePaymentRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: CreatePaymentRequest.AsObject);
  getShipmentId(): string;
  setShipmentId(value: string): CreatePaymentRequest;

  getUserId(): string;
  setUserId(value: string): CreatePaymentRequest;

  getMethod(): string;
  setMethod(value: string): CreatePaymentRequest;

  getChannel(): string;
  setChannel(value: string): CreatePaymentRequest;

  getAmount(): number;
  setAmount(value: number): CreatePaymentRequest;

  getCodDpAmount(): number;
  setCodDpAmount(value: number): CreatePaymentRequest;

  getCustomerPhone(): string;
  setCustomerPhone(value: string): CreatePaymentRequest;

  getCustomerName(): string;
  setCustomerName(value: string): CreatePaymentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreatePaymentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreatePaymentRequest): CreatePaymentRequest.AsObject;
  static serializeBinaryToWriter(message: CreatePaymentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreatePaymentRequest;
  static deserializeBinaryFromReader(message: CreatePaymentRequest, reader: jspb.BinaryReader): CreatePaymentRequest;
}

export namespace CreatePaymentRequest {
  export type AsObject = {
    shipmentId: string;
    userId: string;
    method: string;
    channel: string;
    amount: number;
    codDpAmount: number;
    customerPhone: string;
    customerName: string;
  };
}

export class CreatePaymentResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: CreatePaymentResponse.AsObject);
  getPaymentId(): string;
  setPaymentId(value: string): CreatePaymentResponse;

  getMethod(): string;
  setMethod(value: string): CreatePaymentResponse;

  getChannel(): string;
  setChannel(value: string): CreatePaymentResponse;

  getAmount(): number;
  setAmount(value: number): CreatePaymentResponse;

  getDpAmount(): number;
  setDpAmount(value: number): CreatePaymentResponse;

  getRemainingAmount(): number;
  setRemainingAmount(value: number): CreatePaymentResponse;

  getVaNumber(): string;
  setVaNumber(value: string): CreatePaymentResponse;

  getBankAccountNumber(): string;
  setBankAccountNumber(value: string): CreatePaymentResponse;

  getBankAccountName(): string;
  setBankAccountName(value: string): CreatePaymentResponse;

  getStatus(): string;
  setStatus(value: string): CreatePaymentResponse;

  getExpiredAt(): string;
  setExpiredAt(value: string): CreatePaymentResponse;

  getMessage(): string;
  setMessage(value: string): CreatePaymentResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreatePaymentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreatePaymentResponse): CreatePaymentResponse.AsObject;
  static serializeBinaryToWriter(message: CreatePaymentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreatePaymentResponse;
  static deserializeBinaryFromReader(message: CreatePaymentResponse, reader: jspb.BinaryReader): CreatePaymentResponse;
}

export namespace CreatePaymentResponse {
  export type AsObject = {
    paymentId: string;
    method: string;
    channel: string;
    amount: number;
    dpAmount: number;
    remainingAmount: number;
    vaNumber: string;
    bankAccountNumber: string;
    bankAccountName: string;
    status: string;
    expiredAt: string;
    message: string;
  };
}

export class GetPaymentStatusRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: GetPaymentStatusRequest.AsObject);
  getPaymentId(): string;
  setPaymentId(value: string): GetPaymentStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPaymentStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPaymentStatusRequest): GetPaymentStatusRequest.AsObject;
  static serializeBinaryToWriter(message: GetPaymentStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPaymentStatusRequest;
  static deserializeBinaryFromReader(message: GetPaymentStatusRequest, reader: jspb.BinaryReader): GetPaymentStatusRequest;
}

export namespace GetPaymentStatusRequest {
  export type AsObject = {
    paymentId: string;
  };
}

export class GetPaymentStatusResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: GetPaymentStatusResponse.AsObject);
  getPaymentId(): string;
  setPaymentId(value: string): GetPaymentStatusResponse;

  getShipmentId(): string;
  setShipmentId(value: string): GetPaymentStatusResponse;

  getMethod(): string;
  setMethod(value: string): GetPaymentStatusResponse;

  getChannel(): string;
  setChannel(value: string): GetPaymentStatusResponse;

  getAmount(): number;
  setAmount(value: number): GetPaymentStatusResponse;

  getDpAmount(): number;
  setDpAmount(value: number): GetPaymentStatusResponse;

  getRemainingAmount(): number;
  setRemainingAmount(value: number): GetPaymentStatusResponse;

  getVaNumber(): string;
  setVaNumber(value: string): GetPaymentStatusResponse;

  getStatus(): string;
  setStatus(value: string): GetPaymentStatusResponse;

  getExpiredAt(): string;
  setExpiredAt(value: string): GetPaymentStatusResponse;

  getConfirmedAt(): string;
  setConfirmedAt(value: string): GetPaymentStatusResponse;

  getCreatedAt(): string;
  setCreatedAt(value: string): GetPaymentStatusResponse;

  getCustomerPhone(): string;
  setCustomerPhone(value: string): GetPaymentStatusResponse;

  getCustomerName(): string;
  setCustomerName(value: string): GetPaymentStatusResponse;

  getSenderName(): string;
  setSenderName(value: string): GetPaymentStatusResponse;

  getSenderPhone(): string;
  setSenderPhone(value: string): GetPaymentStatusResponse;

  getAmountTransferred(): number;
  setAmountTransferred(value: number): GetPaymentStatusResponse;

  getRejectionReason(): string;
  setRejectionReason(value: string): GetPaymentStatusResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPaymentStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPaymentStatusResponse): GetPaymentStatusResponse.AsObject;
  static serializeBinaryToWriter(message: GetPaymentStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPaymentStatusResponse;
  static deserializeBinaryFromReader(message: GetPaymentStatusResponse, reader: jspb.BinaryReader): GetPaymentStatusResponse;
}

export namespace GetPaymentStatusResponse {
  export type AsObject = {
    paymentId: string;
    shipmentId: string;
    method: string;
    channel: string;
    amount: number;
    dpAmount: number;
    remainingAmount: number;
    vaNumber: string;
    status: string;
    expiredAt: string;
    confirmedAt: string;
    createdAt: string;
    customerPhone: string;
    customerName: string;
    senderName: string;
    senderPhone: string;
    amountTransferred: number;
    rejectionReason: string;
  };
}

export class ConfirmPaymentRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: ConfirmPaymentRequest.AsObject);
  getPaymentId(): string;
  setPaymentId(value: string): ConfirmPaymentRequest;

  getConfirmedBy(): string;
  setConfirmedBy(value: string): ConfirmPaymentRequest;

  getProofImageUrl(): string;
  setProofImageUrl(value: string): ConfirmPaymentRequest;

  getSenderName(): string;
  setSenderName(value: string): ConfirmPaymentRequest;

  getSenderPhone(): string;
  setSenderPhone(value: string): ConfirmPaymentRequest;

  getAmountTransferred(): number;
  setAmountTransferred(value: number): ConfirmPaymentRequest;

  getBankSender(): string;
  setBankSender(value: string): ConfirmPaymentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConfirmPaymentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ConfirmPaymentRequest): ConfirmPaymentRequest.AsObject;
  static serializeBinaryToWriter(message: ConfirmPaymentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConfirmPaymentRequest;
  static deserializeBinaryFromReader(message: ConfirmPaymentRequest, reader: jspb.BinaryReader): ConfirmPaymentRequest;
}

export namespace ConfirmPaymentRequest {
  export type AsObject = {
    paymentId: string;
    confirmedBy: string;
    proofImageUrl: string;
    senderName: string;
    senderPhone: string;
    amountTransferred: number;
    bankSender: string;
  };
}

export class ConfirmPaymentResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: ConfirmPaymentResponse.AsObject);
  getSuccess(): boolean;
  setSuccess(value: boolean): ConfirmPaymentResponse;

  getMessage(): string;
  setMessage(value: string): ConfirmPaymentResponse;

  getPaymentId(): string;
  setPaymentId(value: string): ConfirmPaymentResponse;

  getStatus(): string;
  setStatus(value: string): ConfirmPaymentResponse;

  getRejectionReason(): string;
  setRejectionReason(value: string): ConfirmPaymentResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConfirmPaymentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ConfirmPaymentResponse): ConfirmPaymentResponse.AsObject;
  static serializeBinaryToWriter(message: ConfirmPaymentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConfirmPaymentResponse;
  static deserializeBinaryFromReader(message: ConfirmPaymentResponse, reader: jspb.BinaryReader): ConfirmPaymentResponse;
}

export namespace ConfirmPaymentResponse {
  export type AsObject = {
    success: boolean;
    message: string;
    paymentId: string;
    status: string;
    rejectionReason: string;
  };
}

export class ProcessVATransactionRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: ProcessVATransactionRequest.AsObject);
  getVaNumber(): string;
  setVaNumber(value: string): ProcessVATransactionRequest;

  getAmount(): number;
  setAmount(value: number): ProcessVATransactionRequest;

  getTransactionId(): string;
  setTransactionId(value: string): ProcessVATransactionRequest;

  getPaymentDate(): string;
  setPaymentDate(value: string): ProcessVATransactionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProcessVATransactionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ProcessVATransactionRequest): ProcessVATransactionRequest.AsObject;
  static serializeBinaryToWriter(message: ProcessVATransactionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProcessVATransactionRequest;
  static deserializeBinaryFromReader(message: ProcessVATransactionRequest, reader: jspb.BinaryReader): ProcessVATransactionRequest;
}

export namespace ProcessVATransactionRequest {
  export type AsObject = {
    vaNumber: string;
    amount: number;
    transactionId: string;
    paymentDate: string;
  };
}

export class ProcessVATransactionResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: ProcessVATransactionResponse.AsObject);
  getSuccess(): boolean;
  setSuccess(value: boolean): ProcessVATransactionResponse;

  getStatus(): string;
  setStatus(value: string): ProcessVATransactionResponse;

  getMessage(): string;
  setMessage(value: string): ProcessVATransactionResponse;

  getShipmentId(): string;
  setShipmentId(value: string): ProcessVATransactionResponse;

  getPaymentId(): string;
  setPaymentId(value: string): ProcessVATransactionResponse;

  getRejectionReason(): string;
  setRejectionReason(value: string): ProcessVATransactionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProcessVATransactionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ProcessVATransactionResponse): ProcessVATransactionResponse.AsObject;
  static serializeBinaryToWriter(message: ProcessVATransactionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProcessVATransactionResponse;
  static deserializeBinaryFromReader(message: ProcessVATransactionResponse, reader: jspb.BinaryReader): ProcessVATransactionResponse;
}

export namespace ProcessVATransactionResponse {
  export type AsObject = {
    success: boolean;
    status: string;
    message: string;
    shipmentId: string;
    paymentId: string;
    rejectionReason: string;
  };
}

export class GetPaymentMethodsRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: GetPaymentMethodsRequest.AsObject);
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPaymentMethodsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPaymentMethodsRequest): GetPaymentMethodsRequest.AsObject;
  static serializeBinaryToWriter(message: GetPaymentMethodsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPaymentMethodsRequest;
  static deserializeBinaryFromReader(message: GetPaymentMethodsRequest, reader: jspb.BinaryReader): GetPaymentMethodsRequest;
}

export namespace GetPaymentMethodsRequest {
  export type AsObject = {
  };
}

export class PaymentMethodInfo extends jspb.Message {
  constructor();
  constructor(opt_data?: PaymentMethodInfo.AsObject);
  getMethod(): string;
  setMethod(value: string): PaymentMethodInfo;

  getChannel(): string;
  setChannel(value: string): PaymentMethodInfo;

  getDisplayName(): string;
  setDisplayName(value: string): PaymentMethodInfo;

  getBankAccountNumber(): string;
  setBankAccountNumber(value: string): PaymentMethodInfo;

  getBankAccountName(): string;
  setBankAccountName(value: string): PaymentMethodInfo;

  getIsActive(): boolean;
  setIsActive(value: boolean): PaymentMethodInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaymentMethodInfo.AsObject;
  static toObject(includeInstance: boolean, msg: PaymentMethodInfo): PaymentMethodInfo.AsObject;
  static serializeBinaryToWriter(message: PaymentMethodInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaymentMethodInfo;
  static deserializeBinaryFromReader(message: PaymentMethodInfo, reader: jspb.BinaryReader): PaymentMethodInfo;
}

export namespace PaymentMethodInfo {
  export type AsObject = {
    method: string;
    channel: string;
    displayName: string;
    bankAccountNumber: string;
    bankAccountName: string;
    isActive: boolean;
  };
}

export class GetPaymentMethodsResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: GetPaymentMethodsResponse.AsObject);
  getMethodsList(): Array<PaymentMethodInfo>;
  setMethodsList(value: Array<PaymentMethodInfo>): GetPaymentMethodsResponse;
  clearMethodsList(): GetPaymentMethodsResponse;
  addMethods(value?: PaymentMethodInfo, index?: number): PaymentMethodInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPaymentMethodsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPaymentMethodsResponse): GetPaymentMethodsResponse.AsObject;
  static serializeBinaryToWriter(message: GetPaymentMethodsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPaymentMethodsResponse;
  static deserializeBinaryFromReader(message: GetPaymentMethodsResponse, reader: jspb.BinaryReader): GetPaymentMethodsResponse;
}

export namespace GetPaymentMethodsResponse {
  export type AsObject = {
    methodsList: Array<PaymentMethodInfo.AsObject>;
  };
}

export class GetDriverShipmentsRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: GetDriverShipmentsRequest.AsObject);
  getDriverId(): string;
  setDriverId(value: string): GetDriverShipmentsRequest;

  getStatusFilter(): string;
  setStatusFilter(value: string): GetDriverShipmentsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDriverShipmentsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetDriverShipmentsRequest): GetDriverShipmentsRequest.AsObject;
  static serializeBinaryToWriter(message: GetDriverShipmentsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDriverShipmentsRequest;
  static deserializeBinaryFromReader(message: GetDriverShipmentsRequest, reader: jspb.BinaryReader): GetDriverShipmentsRequest;
}

export namespace GetDriverShipmentsRequest {
  export type AsObject = {
    driverId: string;
    statusFilter: string;
  };
}

export class DriverShipmentItem extends jspb.Message {
  constructor();
  constructor(opt_data?: DriverShipmentItem.AsObject);
  getShipmentId(): string;
  setShipmentId(value: string): DriverShipmentItem;

  getTrackingNumber(): string;
  setTrackingNumber(value: string): DriverShipmentItem;

  getSenderName(): string;
  setSenderName(value: string): DriverShipmentItem;

  getSenderAddress(): string;
  setSenderAddress(value: string): DriverShipmentItem;

  getSenderPhone(): string;
  setSenderPhone(value: string): DriverShipmentItem;

  getReceiverName(): string;
  setReceiverName(value: string): DriverShipmentItem;

  getReceiverAddress(): string;
  setReceiverAddress(value: string): DriverShipmentItem;

  getReceiverPhone(): string;
  setReceiverPhone(value: string): DriverShipmentItem;

  getWeightKg(): number;
  setWeightKg(value: number): DriverShipmentItem;

  getServiceType(): string;
  setServiceType(value: string): DriverShipmentItem;

  getTotalCost(): number;
  setTotalCost(value: number): DriverShipmentItem;

  getStatus(): string;
  setStatus(value: string): DriverShipmentItem;

  getPaymentMethod(): string;
  setPaymentMethod(value: string): DriverShipmentItem;

  getCodAmountToCollect(): number;
  setCodAmountToCollect(value: number): DriverShipmentItem;

  getCreatedAt(): string;
  setCreatedAt(value: string): DriverShipmentItem;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DriverShipmentItem.AsObject;
  static toObject(includeInstance: boolean, msg: DriverShipmentItem): DriverShipmentItem.AsObject;
  static serializeBinaryToWriter(message: DriverShipmentItem, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DriverShipmentItem;
  static deserializeBinaryFromReader(message: DriverShipmentItem, reader: jspb.BinaryReader): DriverShipmentItem;
}

export namespace DriverShipmentItem {
  export type AsObject = {
    shipmentId: string;
    trackingNumber: string;
    senderName: string;
    senderAddress: string;
    senderPhone: string;
    receiverName: string;
    receiverAddress: string;
    receiverPhone: string;
    weightKg: number;
    serviceType: string;
    totalCost: number;
    status: string;
    paymentMethod: string;
    codAmountToCollect: number;
    createdAt: string;
  };
}

export class GetDriverShipmentsResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: GetDriverShipmentsResponse.AsObject);
  getShipmentsList(): Array<DriverShipmentItem>;
  setShipmentsList(value: Array<DriverShipmentItem>): GetDriverShipmentsResponse;
  clearShipmentsList(): GetDriverShipmentsResponse;
  addShipments(value?: DriverShipmentItem, index?: number): DriverShipmentItem;

  getTotalCount(): number;
  setTotalCount(value: number): GetDriverShipmentsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDriverShipmentsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetDriverShipmentsResponse): GetDriverShipmentsResponse.AsObject;
  static serializeBinaryToWriter(message: GetDriverShipmentsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDriverShipmentsResponse;
  static deserializeBinaryFromReader(message: GetDriverShipmentsResponse, reader: jspb.BinaryReader): GetDriverShipmentsResponse;
}

export namespace GetDriverShipmentsResponse {
  export type AsObject = {
    shipmentsList: Array<DriverShipmentItem.AsObject>;
    totalCount: number;
  };
}

export class AcceptJobRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: AcceptJobRequest.AsObject);
  getShipmentId(): string;
  setShipmentId(value: string): AcceptJobRequest;

  getDriverId(): string;
  setDriverId(value: string): AcceptJobRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AcceptJobRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AcceptJobRequest): AcceptJobRequest.AsObject;
  static serializeBinaryToWriter(message: AcceptJobRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AcceptJobRequest;
  static deserializeBinaryFromReader(message: AcceptJobRequest, reader: jspb.BinaryReader): AcceptJobRequest;
}

export namespace AcceptJobRequest {
  export type AsObject = {
    shipmentId: string;
    driverId: string;
  };
}

export class AcceptJobResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: AcceptJobResponse.AsObject);
  getSuccess(): boolean;
  setSuccess(value: boolean): AcceptJobResponse;

  getMessage(): string;
  setMessage(value: string): AcceptJobResponse;

  getTrackingNumber(): string;
  setTrackingNumber(value: string): AcceptJobResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AcceptJobResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AcceptJobResponse): AcceptJobResponse.AsObject;
  static serializeBinaryToWriter(message: AcceptJobResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AcceptJobResponse;
  static deserializeBinaryFromReader(message: AcceptJobResponse, reader: jspb.BinaryReader): AcceptJobResponse;
}

export namespace AcceptJobResponse {
  export type AsObject = {
    success: boolean;
    message: string;
    trackingNumber: string;
  };
}

export class UpdateLocationRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: UpdateLocationRequest.AsObject);
  getDriverId(): string;
  setDriverId(value: string): UpdateLocationRequest;

  getShipmentId(): string;
  setShipmentId(value: string): UpdateLocationRequest;

  getLatitude(): number;
  setLatitude(value: number): UpdateLocationRequest;

  getLongitude(): number;
  setLongitude(value: number): UpdateLocationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateLocationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateLocationRequest): UpdateLocationRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateLocationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateLocationRequest;
  static deserializeBinaryFromReader(message: UpdateLocationRequest, reader: jspb.BinaryReader): UpdateLocationRequest;
}

export namespace UpdateLocationRequest {
  export type AsObject = {
    driverId: string;
    shipmentId: string;
    latitude: number;
    longitude: number;
  };
}

export class UpdateLocationResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: UpdateLocationResponse.AsObject);
  getSuccess(): boolean;
  setSuccess(value: boolean): UpdateLocationResponse;

  getMessage(): string;
  setMessage(value: string): UpdateLocationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateLocationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateLocationResponse): UpdateLocationResponse.AsObject;
  static serializeBinaryToWriter(message: UpdateLocationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateLocationResponse;
  static deserializeBinaryFromReader(message: UpdateLocationResponse, reader: jspb.BinaryReader): UpdateLocationResponse;
}

export namespace UpdateLocationResponse {
  export type AsObject = {
    success: boolean;
    message: string;
  };
}

export class CompleteDeliveryRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: CompleteDeliveryRequest.AsObject);
  getShipmentId(): string;
  setShipmentId(value: string): CompleteDeliveryRequest;

  getDriverId(): string;
  setDriverId(value: string): CompleteDeliveryRequest;

  getProofImageUrl(): string;
  setProofImageUrl(value: string): CompleteDeliveryRequest;

  getRecipientName(): string;
  setRecipientName(value: string): CompleteDeliveryRequest;

  getNotes(): string;
  setNotes(value: string): CompleteDeliveryRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompleteDeliveryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CompleteDeliveryRequest): CompleteDeliveryRequest.AsObject;
  static serializeBinaryToWriter(message: CompleteDeliveryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompleteDeliveryRequest;
  static deserializeBinaryFromReader(message: CompleteDeliveryRequest, reader: jspb.BinaryReader): CompleteDeliveryRequest;
}

export namespace CompleteDeliveryRequest {
  export type AsObject = {
    shipmentId: string;
    driverId: string;
    proofImageUrl: string;
    recipientName: string;
    notes: string;
  };
}

export class CompleteDeliveryResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: CompleteDeliveryResponse.AsObject);
  getSuccess(): boolean;
  setSuccess(value: boolean): CompleteDeliveryResponse;

  getMessage(): string;
  setMessage(value: string): CompleteDeliveryResponse;

  getTrackingNumber(): string;
  setTrackingNumber(value: string): CompleteDeliveryResponse;

  getCompletedAt(): string;
  setCompletedAt(value: string): CompleteDeliveryResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompleteDeliveryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CompleteDeliveryResponse): CompleteDeliveryResponse.AsObject;
  static serializeBinaryToWriter(message: CompleteDeliveryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompleteDeliveryResponse;
  static deserializeBinaryFromReader(message: CompleteDeliveryResponse, reader: jspb.BinaryReader): CompleteDeliveryResponse;
}

export namespace CompleteDeliveryResponse {
  export type AsObject = {
    success: boolean;
    message: string;
    trackingNumber: string;
    completedAt: string;
  };
}

export class CollectCODRequest extends jspb.Message {
  constructor();
  constructor(opt_data?: CollectCODRequest.AsObject);
  getShipmentId(): string;
  setShipmentId(value: string): CollectCODRequest;

  getDriverId(): string;
  setDriverId(value: string): CollectCODRequest;

  getAmountCollected(): number;
  setAmountCollected(value: number): CollectCODRequest;

  getCollectionType(): string;
  setCollectionType(value: string): CollectCODRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CollectCODRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CollectCODRequest): CollectCODRequest.AsObject;
  static serializeBinaryToWriter(message: CollectCODRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CollectCODRequest;
  static deserializeBinaryFromReader(message: CollectCODRequest, reader: jspb.BinaryReader): CollectCODRequest;
}

export namespace CollectCODRequest {
  export type AsObject = {
    shipmentId: string;
    driverId: string;
    amountCollected: number;
    collectionType: string;
  };
}

export class CollectCODResponse extends jspb.Message {
  constructor();
  constructor(opt_data?: CollectCODResponse.AsObject);
  getSuccess(): boolean;
  setSuccess(value: boolean): CollectCODResponse;

  getMessage(): string;
  setMessage(value: string): CollectCODResponse;

  getTotalCollected(): number;
  setTotalCollected(value: number): CollectCODResponse;

  getRemaining(): number;
  setRemaining(value: number): CollectCODResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CollectCODResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CollectCODResponse): CollectCODResponse.AsObject;
  static serializeBinaryToWriter(message: CollectCODResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CollectCODResponse;
  static deserializeBinaryFromReader(message: CollectCODResponse, reader: jspb.BinaryReader): CollectCODResponse;
}

export namespace CollectCODResponse {
  export type AsObject = {
    success: boolean;
    message: string;
    totalCollected: number;
    remaining: number;
  };
}

