export interface LocationHub {
  id: string;
  villageId: string;
  name: string;
  district: string;
  city: string;
  province: string;
  isJavaIsland: boolean;
}

export const SHIPPING_LOCATIONS: LocationHub[] = [
  {
    id: 'jkt-kramat-jati',
    villageId: '3175061001',
    name: 'Kramat Jati',
    district: 'Kramat Jati',
    city: 'Jakarta Timur',
    province: 'DKI Jakarta',
    isJavaIsland: true,
  },
  {
    id: 'bks-rawalum',
    villageId: '3275041002',
    name: 'Sepanjang Jaya',
    district: 'Rawalumbu',
    city: 'Kota Bekasi',
    province: 'Jawa Barat',
    isJavaIsland: true,
  },
  {
    id: 'bdg-coblong',
    villageId: '3273011001',
    name: 'Dago',
    district: 'Coblong',
    city: 'Kota Bandung',
    province: 'Jawa Barat',
    isJavaIsland: true,
  },
  {
    id: 'smg-candisari',
    villageId: '3374021001',
    name: 'Candi',
    district: 'Candisari',
    city: 'Kota Semarang',
    province: 'Jawa Tengah',
    isJavaIsland: true,
  },
  {
    id: 'sby-gubeng',
    villageId: '3578031001',
    name: 'Gubeng',
    district: 'Gubeng',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    isJavaIsland: true,
  },
  {
    id: 'mdn-amplas',
    villageId: '1271041001',
    name: 'Timbang Deli',
    district: 'Medan Amplas',
    city: 'Kota Medan',
    province: 'Sumatera Utara',
    isJavaIsland: false,
  },
  {
    id: 'mks-panakkukang',
    villageId: '7371051001',
    name: 'Pannampu',
    district: 'Panakkukang',
    city: 'Kota Makassar',
    province: 'Sulawesi Selatan',
    isJavaIsland: false,
  },
  {
    id: 'dps-denbar',
    villageId: '5171011001',
    name: 'Pemecutan',
    district: 'Denpasar Barat',
    city: 'Kota Denpasar',
    province: 'Bali',
    isJavaIsland: false,
  },
];

