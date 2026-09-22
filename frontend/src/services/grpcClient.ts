import {
  AuthServiceClient,
  RateServiceClient,
  ShipmentServiceClient,
  PaymentServiceClient,
} from '../proto/KurbhanServiceClientPb';

// Gateway URL dari environment variable — TIDAK hardcode
const ENVOY_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085';

export const authServiceClient = new AuthServiceClient(ENVOY_URL, null, null);
export const rateServiceClient = new RateServiceClient(ENVOY_URL, null, null);
export const shipmentServiceClient = new ShipmentServiceClient(ENVOY_URL, null, null);
export const paymentServiceClient = new PaymentServiceClient(ENVOY_URL, null, null);
