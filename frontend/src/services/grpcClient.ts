import { AuthServiceClient, RateServiceClient, ShipmentServiceClient } from '../proto/KurbhanServiceClientPb';


// Inisialisasi client tunggal untuk memanggil RPC services

const ENVOY_URL = 'http://localhost:8080';

export const authServiceClient = new AuthServiceClient(ENVOY_URL, null, null);
export const rateServiceClient = new RateServiceClient(ENVOY_URL, null, null);
export const shipmentServiceClient = new ShipmentServiceClient(ENVOY_URL, null, null);
