export interface StoredShipment {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  originLocation: string;
  destinationLocation: string;
  weightKg: number;
  serviceType: string;
  totalCost: number;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'VERIFIED';
  paymentMethod: string;
  vehicleType: string;
  assignedDriver?: string;
  createdAt: string;
}

const STORAGE_KEY = 'kurbhan_stored_shipments';

const INITIAL_DEMO_SHIPMENTS: StoredShipment[] = [
  {
    id: 'ship-001',
    trackingNumber: 'KB-20260901-ABC1',
    senderName: 'Budi Santoso',
    senderAddress: 'Jl. Kramat Jati No. 45, Jakarta Timur',
    senderPhone: '081234567890',
    receiverName: 'Siti Rahma',
    receiverAddress: 'Jl. Pemuda No. 12, Sepanjang Jaya, Bekasi',
    receiverPhone: '087812345678',
    originLocation: 'Jakarta Timur (DKI Jakarta)',
    destinationLocation: 'Kota Bekasi (Jawa Barat)',
    weightKg: 5.5,
    serviceType: 'express',
    totalCost: 45000,
    status: 'IN_TRANSIT',
    paymentStatus: 'VERIFIED',
    paymentMethod: 'QRIS Instan',
    vehicleType: 'mobil_box_kecil',
    assignedDriver: 'Pak Joko (B 1234 KBH)',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'ship-002',
    trackingNumber: 'KB-20260902-XYZ9',
    senderName: 'Toko Elektronik Makmur',
    senderAddress: 'Mangga Dua Mall Blok B, Jakarta',
    senderPhone: '081399887766',
    receiverName: 'Andi Wijaya',
    receiverAddress: 'Jl. Dago Atas No. 88, Bandung',
    receiverPhone: '085211223344',
    originLocation: 'Jakarta Timur (DKI Jakarta)',
    destinationLocation: 'Kota Bandung (Jawa Barat)',
    weightKg: 12.0,
    serviceType: 'reguler',
    totalCost: 85000,
    status: 'PICKED_UP',
    paymentStatus: 'VERIFIED',
    paymentMethod: 'BCA Virtual Account',
    vehicleType: 'mobil_box_sedang',
    assignedDriver: 'Pak Hendra (D 4567 KBH)',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  }
];

export function getStoredShipments(): StoredShipment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SHIPMENTS));
      return INITIAL_DEMO_SHIPMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_SHIPMENTS;
  }
}

export function saveShipment(shipment: StoredShipment): void {
  const current = getStoredShipments();
  const updated = [shipment, ...current.filter(s => s.trackingNumber !== shipment.trackingNumber)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function updateStoredShipmentStatus(
  trackingNumber: string,
  newStatus: StoredShipment['status'],
  assignedDriver?: string
): void {
  const current = getStoredShipments();
  const updated = current.map(s => {
    if (s.trackingNumber === trackingNumber) {
      return {
        ...s,
        status: newStatus,
        assignedDriver: assignedDriver || s.assignedDriver,
      };
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function updateStoredPaymentStatus(
  trackingNumber: string,
  newPaymentStatus: 'UNPAID' | 'VERIFIED'
): void {
  const current = getStoredShipments();
  const updated = current.map(s => {
    if (s.trackingNumber === trackingNumber) {
      return {
        ...s,
        paymentStatus: newPaymentStatus,
      };
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

