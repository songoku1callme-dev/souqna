import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CURRENT_USER_ID, ORDERS } from '@/data/orders';
import type { Order, OrderStatus, Shipment, ShipmentStatus } from '@/types';

/** Fields a seller can edit when adding/updating shipping for an order. */
export type ShipmentInput = {
  courierName?: string;
  provider?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status?: ShipmentStatus;
  estimatedDeliveryAt?: string;
  noteToBuyer?: string;
};

type OrdersState = {
  orders: Order[];
  getById: (id: string) => Order | undefined;
  addOrder: (order: Order) => void;
  updateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  saveShipment: (orderId: string, input: ShipmentInput) => void;
  reportIssue: (orderId: string, note: string) => void;
  reset: () => void;
};

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const seed = (): Order[] => JSON.parse(JSON.stringify(ORDERS)) as Order[];

/** Default shipment status implied by a manually added shipment. */
function defaultShipmentStatus(orderStatus: OrderStatus): ShipmentStatus {
  if (orderStatus === 'delivered') return 'delivered';
  if (orderStatus === 'out_for_delivery') return 'out_for_delivery';
  return 'in_transit';
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: seed(),

      getById: (id) => get().orders.find((o) => o.id === id),

      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

      updateStatus: (orderId, status, note) =>
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const at = new Date().toISOString();
            return {
              ...order,
              status,
              deliveredAt: status === 'delivered' ? at : order.deliveredAt,
              statusHistory: [
                ...order.statusHistory,
                { id: uid('sh'), orderId, status, note, createdAt: at },
              ],
              updatedAt: at,
            };
          }),
        })),

      saveShipment: (orderId, input) =>
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const at = new Date().toISOString();
            const prev = order.shipment;
            const shipmentStatus = input.status ?? prev?.status ?? defaultShipmentStatus(order.status);
            const shipment: Shipment = {
              id: prev?.id ?? uid('shp'),
              orderId,
              courierName: input.courierName ?? prev?.courierName,
              provider: input.provider ?? prev?.provider,
              trackingNumber: input.trackingNumber ?? prev?.trackingNumber,
              trackingUrl: input.trackingUrl ?? prev?.trackingUrl,
              status: shipmentStatus,
              estimatedDeliveryAt: input.estimatedDeliveryAt ?? prev?.estimatedDeliveryAt,
              deliveredAt: shipmentStatus === 'delivered' ? at : prev?.deliveredAt,
              noteToBuyer: input.noteToBuyer ?? prev?.noteToBuyer,
              updates: prev?.updates ?? [],
              createdAt: prev?.createdAt ?? at,
              updatedAt: at,
            };
            // Adding shipping moves a not-yet-shipped order into "shipped".
            const advanced: OrderStatus =
              order.status === 'pending' ||
              order.status === 'confirmed' ||
              order.status === 'preparing'
                ? 'shipped'
                : order.status;
            const statusChanged = advanced !== order.status;
            return {
              ...order,
              shipment,
              status: advanced,
              estimatedDeliveryAt: input.estimatedDeliveryAt ?? order.estimatedDeliveryAt,
              statusHistory: statusChanged
                ? [
                    ...order.statusHistory,
                    { id: uid('sh'), orderId, status: advanced, createdAt: at },
                  ]
                : order.statusHistory,
              updatedAt: at,
            };
          }),
        })),

      reportIssue: (orderId, note) =>
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const at = new Date().toISOString();
            return {
              ...order,
              status: 'issue_reported',
              issueNote: note,
              statusHistory: [
                ...order.statusHistory,
                { id: uid('sh'), orderId, status: 'issue_reported', note, createdAt: at },
              ],
              updatedAt: at,
            };
          }),
        })),

      reset: () => set({ orders: seed() }),
    }),
    {
      name: 'souqna.orders',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Keep the demo populated if a previous (empty) state was stored.
        if (state && state.orders.length === 0) state.orders = seed();
      },
    },
  ),
);

/** Orders the signed-in user placed as a buyer. */
export function selectBuyerOrders(orders: Order[]): Order[] {
  return orders
    .filter((o) => o.buyerId === CURRENT_USER_ID)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

/** Orders coming into the signed-in user's shop. */
export function selectSellerOrders(orders: Order[]): Order[] {
  return orders
    .filter((o) => o.sellerId === CURRENT_USER_ID)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}
