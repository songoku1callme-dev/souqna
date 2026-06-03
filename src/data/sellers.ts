import type { SellerSummary } from '@/types';

export const SELLERS: SellerSummary[] = [
  {
    id: 'seller-amal',
    displayName: 'Amal Atelier · أمل',
    status: 'verified',
    cityId: 'damascus',
    ratingAvg: 4.9,
    ratingCount: 128,
    createdAt: '2024-03-12T09:00:00.000Z',
  },
  {
    id: 'seller-zaytoun',
    displayName: 'Zaytoun Crafts · زيتون',
    status: 'verified',
    cityId: 'aleppo',
    ratingAvg: 4.8,
    ratingCount: 86,
    createdAt: '2024-05-01T09:00:00.000Z',
  },
  {
    id: 'seller-tech',
    displayName: 'Sham Electronics · شام',
    status: 'verified',
    cityId: 'latakia',
    ratingAvg: 4.7,
    ratingCount: 203,
    createdAt: '2023-11-20T09:00:00.000Z',
  },
  {
    id: 'seller-noor',
    displayName: 'Noor Beauty · نور',
    status: 'verified',
    cityId: 'homs',
    ratingAvg: 4.6,
    ratingCount: 51,
    createdAt: '2024-08-15T09:00:00.000Z',
  },
  {
    id: 'seller-bayt',
    displayName: 'Bayt al-Dafa · بيت الدفء',
    status: 'verified',
    cityId: 'hama',
    ratingAvg: 4.85,
    ratingCount: 74,
    createdAt: '2024-01-30T09:00:00.000Z',
  },
  {
    id: 'seller-fix',
    displayName: 'FixIt Services · إصلاح',
    status: 'pending',
    cityId: 'deir-ez-zor',
    ratingAvg: undefined,
    ratingCount: 0,
    createdAt: '2025-02-10T09:00:00.000Z',
  },
];

export function getSellerById(id: string): SellerSummary | undefined {
  return SELLERS.find((s) => s.id === id);
}
