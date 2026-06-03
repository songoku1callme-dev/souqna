import type { Order } from '@/types';

/**
 * Seed orders for mock mode. Two perspectives share one list:
 *  - buyerId === CURRENT_USER_ID → the signed-in user's purchases (buyer view)
 *  - sellerId === CURRENT_USER_ID → orders coming into the user's shop (seller view)
 *
 * Content spans the full lifecycle and shows manual local-courier tracking
 * (no global-carrier hardcoding) so the flows are demonstrable end-to-end.
 */
export const CURRENT_USER_ID = 'me';

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();
const img = (seed: string) => `https://picsum.photos/seed/souqna-${seed}/700/700`;

export const ORDERS: Order[] = [
  // 1 — Buyer purchase, just placed (pending)
  {
    id: 'ord-1001',
    reference: 'SQ-2026-1001',
    buyerId: CURRENT_USER_ID,
    buyerName: 'You',
    sellerId: 'seller-zaytoun',
    sellerName: 'Zaytoun Crafts · زيتون',
    sellerVerified: true,
    cityId: 'aleppo',
    items: [
      {
        id: 'oi-1001-1',
        orderId: 'ord-1001',
        listingId: 'lst-olivewood-bowl',
        title: 'Handmade olive wood serving bowl',
        imageUrl: img('bowl-1'),
        unitPrice: 38,
        currency: 'USD',
        quantity: 1,
      },
    ],
    subtotal: 38,
    currency: 'USD',
    status: 'pending',
    statusHistory: [
      { id: 'sh-1001-1', orderId: 'ord-1001', status: 'pending', createdAt: iso(-2 * HOUR) },
    ],
    placedAt: iso(-2 * HOUR),
    updatedAt: iso(-2 * HOUR),
  },

  // 2 — Buyer purchase, seller preparing it
  {
    id: 'ord-1002',
    reference: 'SQ-2026-1002',
    buyerId: CURRENT_USER_ID,
    buyerName: 'You',
    sellerId: 'seller-zaytoun',
    sellerName: 'Zaytoun Crafts · زيتون',
    sellerVerified: true,
    cityId: 'aleppo',
    items: [
      {
        id: 'oi-1002-1',
        orderId: 'ord-1002',
        listingId: 'lst-laurel-soap',
        title: 'Aleppo laurel soap — set of 4',
        imageUrl: img('soap-1'),
        unitPrice: 22,
        currency: 'USD',
        quantity: 2,
      },
    ],
    subtotal: 44,
    currency: 'USD',
    status: 'preparing',
    statusHistory: [
      { id: 'sh-1002-1', orderId: 'ord-1002', status: 'pending', createdAt: iso(-3 * DAY) },
      { id: 'sh-1002-2', orderId: 'ord-1002', status: 'confirmed', createdAt: iso(-2.5 * DAY) },
      { id: 'sh-1002-3', orderId: 'ord-1002', status: 'preparing', createdAt: iso(-1 * DAY) },
    ],
    estimatedDeliveryAt: iso(4 * DAY),
    placedAt: iso(-3 * DAY),
    updatedAt: iso(-1 * DAY),
  },

  // 3 — Buyer purchase, shipped with manual local courier + tracking link
  {
    id: 'ord-1003',
    reference: 'SQ-2026-1003',
    buyerId: CURRENT_USER_ID,
    buyerName: 'You',
    sellerId: 'seller-tech',
    sellerName: 'Sham Electronics · شام',
    sellerVerified: true,
    cityId: 'latakia',
    items: [
      {
        id: 'oi-1003-1',
        orderId: 'ord-1003',
        listingId: 'lst-iphone',
        title: 'iPhone 13 — 128GB, unlocked',
        imageUrl: img('iphone-1'),
        unitPrice: 410,
        currency: 'USD',
        quantity: 1,
      },
    ],
    subtotal: 410,
    currency: 'USD',
    status: 'out_for_delivery',
    statusHistory: [
      { id: 'sh-1003-1', orderId: 'ord-1003', status: 'pending', createdAt: iso(-5 * DAY) },
      { id: 'sh-1003-2', orderId: 'ord-1003', status: 'confirmed', createdAt: iso(-4.5 * DAY) },
      { id: 'sh-1003-3', orderId: 'ord-1003', status: 'preparing', createdAt: iso(-4 * DAY) },
      { id: 'sh-1003-4', orderId: 'ord-1003', status: 'shipped', createdAt: iso(-2 * DAY) },
      {
        id: 'sh-1003-5',
        orderId: 'ord-1003',
        status: 'out_for_delivery',
        createdAt: iso(-3 * HOUR),
      },
    ],
    shipment: {
      id: 'shp-1003',
      orderId: 'ord-1003',
      courierName: 'Al-Fares Express',
      provider: 'Al-Fares Logistics',
      trackingNumber: 'AF-93817254',
      trackingUrl: 'https://track.alfares.example/AF-93817254',
      status: 'out_for_delivery',
      estimatedDeliveryAt: iso(6 * HOUR),
      noteToBuyer: 'Driver will call before arriving. Please keep your phone reachable.',
      updates: [
        {
          id: 'su-1003-1',
          shipmentId: 'shp-1003',
          status: 'in_transit',
          description: 'Picked up from Latakia hub',
          createdAt: iso(-2 * DAY),
        },
        {
          id: 'su-1003-2',
          shipmentId: 'shp-1003',
          status: 'out_for_delivery',
          description: 'Out for delivery in Damascus',
          createdAt: iso(-3 * HOUR),
        },
      ],
      createdAt: iso(-2 * DAY),
      updatedAt: iso(-3 * HOUR),
    },
    estimatedDeliveryAt: iso(6 * HOUR),
    placedAt: iso(-5 * DAY),
    updatedAt: iso(-3 * HOUR),
  },

  // 4 — Buyer purchase, delivered
  {
    id: 'ord-1004',
    reference: 'SQ-2026-1004',
    buyerId: CURRENT_USER_ID,
    buyerName: 'You',
    sellerId: 'seller-noor',
    sellerName: 'Noor Beauty · نور',
    sellerVerified: true,
    cityId: 'homs',
    items: [
      {
        id: 'oi-1004-1',
        orderId: 'ord-1004',
        listingId: 'lst-rosewater',
        title: 'Damascus rose water — 500ml',
        imageUrl: img('rose-1'),
        unitPrice: 16,
        currency: 'USD',
        quantity: 3,
      },
    ],
    subtotal: 48,
    currency: 'USD',
    status: 'delivered',
    statusHistory: [
      { id: 'sh-1004-1', orderId: 'ord-1004', status: 'pending', createdAt: iso(-12 * DAY) },
      { id: 'sh-1004-2', orderId: 'ord-1004', status: 'confirmed', createdAt: iso(-11 * DAY) },
      { id: 'sh-1004-3', orderId: 'ord-1004', status: 'shipped', createdAt: iso(-9 * DAY) },
      { id: 'sh-1004-4', orderId: 'ord-1004', status: 'delivered', createdAt: iso(-7 * DAY) },
    ],
    shipment: {
      id: 'shp-1004',
      orderId: 'ord-1004',
      courierName: 'Homs City Delivery',
      trackingNumber: 'HCD-5521',
      status: 'delivered',
      deliveredAt: iso(-7 * DAY),
      updates: [],
      createdAt: iso(-9 * DAY),
      updatedAt: iso(-7 * DAY),
    },
    deliveredAt: iso(-7 * DAY),
    placedAt: iso(-12 * DAY),
    updatedAt: iso(-7 * DAY),
  },

  // 5 — Buyer purchase with a reported issue (moderation-friendly state)
  {
    id: 'ord-1005',
    reference: 'SQ-2026-1005',
    buyerId: CURRENT_USER_ID,
    buyerName: 'You',
    sellerId: 'seller-tech',
    sellerName: 'Sham Electronics · شام',
    sellerVerified: true,
    cityId: 'latakia',
    items: [
      {
        id: 'oi-1005-1',
        orderId: 'ord-1005',
        listingId: 'lst-headphones',
        title: 'Wireless noise-cancelling headphones',
        imageUrl: img('headphones-1'),
        unitPrice: 120,
        currency: 'USD',
        quantity: 1,
      },
    ],
    subtotal: 120,
    currency: 'USD',
    status: 'issue_reported',
    statusHistory: [
      { id: 'sh-1005-1', orderId: 'ord-1005', status: 'pending', createdAt: iso(-8 * DAY) },
      { id: 'sh-1005-2', orderId: 'ord-1005', status: 'confirmed', createdAt: iso(-7 * DAY) },
      { id: 'sh-1005-3', orderId: 'ord-1005', status: 'shipped', createdAt: iso(-5 * DAY) },
      {
        id: 'sh-1005-4',
        orderId: 'ord-1005',
        status: 'issue_reported',
        note: 'Package arrived damaged',
        createdAt: iso(-1 * DAY),
      },
    ],
    issueNote: 'Package arrived damaged — requesting support.',
    placedAt: iso(-8 * DAY),
    updatedAt: iso(-1 * DAY),
  },

  // 6 — Incoming order to the user's shop, awaiting confirmation
  {
    id: 'ord-2001',
    reference: 'SQ-2026-2001',
    buyerId: 'buyer-layla',
    buyerName: 'Layla H.',
    sellerId: CURRENT_USER_ID,
    sellerName: 'Your shop',
    sellerVerified: true,
    cityId: 'hama',
    items: [
      {
        id: 'oi-2001-1',
        orderId: 'ord-2001',
        listingId: 'lst-wool-blanket',
        title: 'Handwoven wool blanket',
        imageUrl: img('blanket-1'),
        unitPrice: 70,
        currency: 'USD',
        quantity: 1,
      },
    ],
    subtotal: 70,
    currency: 'USD',
    status: 'pending',
    statusHistory: [
      { id: 'sh-2001-1', orderId: 'ord-2001', status: 'pending', createdAt: iso(-5 * HOUR) },
    ],
    placedAt: iso(-5 * HOUR),
    updatedAt: iso(-5 * HOUR),
  },

  // 7 — Incoming order, confirmed and being prepared
  {
    id: 'ord-2002',
    reference: 'SQ-2026-2002',
    buyerId: 'buyer-omar',
    buyerName: 'Omar K.',
    sellerId: CURRENT_USER_ID,
    sellerName: 'Your shop',
    sellerVerified: true,
    cityId: 'hama',
    items: [
      {
        id: 'oi-2002-1',
        orderId: 'ord-2002',
        listingId: 'lst-copper-pot',
        title: 'Hand-hammered copper coffee pot',
        imageUrl: img('copper-1'),
        unitPrice: 34,
        currency: 'USD',
        quantity: 2,
      },
    ],
    subtotal: 68,
    currency: 'USD',
    status: 'confirmed',
    statusHistory: [
      { id: 'sh-2002-1', orderId: 'ord-2002', status: 'pending', createdAt: iso(-2 * DAY) },
      { id: 'sh-2002-2', orderId: 'ord-2002', status: 'confirmed', createdAt: iso(-1 * DAY) },
    ],
    placedAt: iso(-2 * DAY),
    updatedAt: iso(-1 * DAY),
  },

  // 8 — Incoming order, already shipped with tracking the seller entered
  {
    id: 'ord-2003',
    reference: 'SQ-2026-2003',
    buyerId: 'buyer-rana',
    buyerName: 'Rana S.',
    sellerId: CURRENT_USER_ID,
    sellerName: 'Your shop',
    sellerVerified: true,
    cityId: 'hama',
    items: [
      {
        id: 'oi-2003-1',
        orderId: 'ord-2003',
        listingId: 'lst-prayer-rug',
        title: 'Soft velvet prayer rug',
        imageUrl: img('rug-1'),
        unitPrice: 12,
        currency: 'USD',
        quantity: 4,
      },
    ],
    subtotal: 48,
    currency: 'USD',
    status: 'shipped',
    statusHistory: [
      { id: 'sh-2003-1', orderId: 'ord-2003', status: 'pending', createdAt: iso(-4 * DAY) },
      { id: 'sh-2003-2', orderId: 'ord-2003', status: 'confirmed', createdAt: iso(-3 * DAY) },
      { id: 'sh-2003-3', orderId: 'ord-2003', status: 'preparing', createdAt: iso(-2 * DAY) },
      { id: 'sh-2003-4', orderId: 'ord-2003', status: 'shipped', createdAt: iso(-1 * DAY) },
    ],
    shipment: {
      id: 'shp-2003',
      orderId: 'ord-2003',
      courierName: 'Hama Quick Ship',
      trackingNumber: 'HQS-7781',
      trackingUrl: 'https://hamaquick.example/track/HQS-7781',
      status: 'in_transit',
      estimatedDeliveryAt: iso(3 * DAY),
      noteToBuyer: 'Shipped this morning, thank you for your order!',
      updates: [
        {
          id: 'su-2003-1',
          shipmentId: 'shp-2003',
          status: 'in_transit',
          description: 'Accepted at Hama depot',
          createdAt: iso(-1 * DAY),
        },
      ],
      createdAt: iso(-1 * DAY),
      updatedAt: iso(-1 * DAY),
    },
    estimatedDeliveryAt: iso(3 * DAY),
    placedAt: iso(-4 * DAY),
    updatedAt: iso(-1 * DAY),
  },
];
