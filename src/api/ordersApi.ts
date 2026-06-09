import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { getListingById } from '@/data/listings';
import { CURRENT_USER_ID } from '@/data/orders';
import { useOrdersStore, selectBuyerOrders } from '@/store/ordersStore';
import type {
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEvent,
  Shipment,
  ShipmentStatus,
  ShipmentUpdate,
} from '@/types';
import { delay } from './client';

/** Input for placing an order from a listing. */
export type PlaceOrderInput = {
  listingId: string;
  quantity: number;
};

/** Raised when checkout is attempted without an authenticated session. */
export class CheckoutAuthError extends Error {
  constructor() {
    super('auth_required');
    this.name = 'CheckoutAuthError';
  }
}

/** Raised when the listing can no longer be purchased (removed / not active / own listing). */
export class ListingUnavailableError extends Error {
  constructor(message = 'listing_unavailable') {
    super(message);
    this.name = 'ListingUnavailableError';
  }
}

/* ------------------------------------------------------------------ *
 * Live row shapes (mirror supabase/schema.sql) + mapping to `Order`
 * ------------------------------------------------------------------ */

type OrderItemRow = {
  id: string;
  listing_id: string | null;
  title: string;
  image_url: string | null;
  unit_price: number;
  currency: string;
  quantity: number;
};

type StatusHistoryRow = {
  id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
};

type ShipmentUpdateRow = {
  id: string;
  status: ShipmentStatus;
  description: string | null;
  created_at: string;
};

type ShipmentRow = {
  id: string;
  courier_name: string | null;
  provider_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  status: ShipmentStatus;
  estimated_delivery_at: string | null;
  delivered_at: string | null;
  note_to_buyer: string | null;
  created_at: string;
  updated_at: string;
  updates: ShipmentUpdateRow[] | null;
};

type OrderRow = {
  id: string;
  reference: string;
  buyer_id: string;
  seller_id: string;
  city_id: string | null;
  subtotal: number;
  currency: string;
  status: OrderStatus;
  estimated_delivery_at: string | null;
  delivered_at: string | null;
  issue_note: string | null;
  placed_at: string;
  updated_at: string;
  buyer: { full_name: string | null } | { full_name: string | null }[] | null;
  seller:
    | { display_name: string | null; status: string | null }
    | { display_name: string | null; status: string | null }[]
    | null;
  items: OrderItemRow[] | null;
  status_history: StatusHistoryRow[] | null;
  shipment: ShipmentRow[] | null;
};

const ORDER_SELECT =
  'id, reference, buyer_id, seller_id, city_id, subtotal, currency, status, estimated_delivery_at, delivered_at, issue_note, placed_at, updated_at, ' +
  'buyer:profiles(full_name), seller:seller_profiles(display_name, status), ' +
  'items:order_items(id, listing_id, title, image_url, unit_price, currency, quantity), ' +
  'status_history:order_status_history(id, status, note, created_at), ' +
  'shipment:shipments(id, courier_name, provider_name, tracking_number, tracking_url, status, estimated_delivery_at, delivered_at, note_to_buyer, created_at, updated_at, updates:shipment_updates(id, status, description, created_at))';

function one<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function mapItem(row: OrderItemRow, orderId: string): OrderItem {
  return {
    id: row.id,
    orderId,
    listingId: row.listing_id ?? '',
    title: row.title,
    imageUrl: row.image_url ?? undefined,
    unitPrice: Number(row.unit_price),
    currency: row.currency,
    quantity: row.quantity,
  };
}

function mapStatusEvent(row: StatusHistoryRow, orderId: string): OrderStatusEvent {
  return {
    id: row.id,
    orderId,
    status: row.status,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

function mapShipment(row: ShipmentRow, orderId: string): Shipment {
  const updates: ShipmentUpdate[] = (row.updates ?? [])
    .map((u) => ({
      id: u.id,
      shipmentId: row.id,
      status: u.status,
      description: u.description ?? undefined,
      createdAt: u.created_at,
    }))
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  return {
    id: row.id,
    orderId,
    courierName: row.courier_name ?? undefined,
    provider: row.provider_name ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    trackingUrl: row.tracking_url ?? undefined,
    status: row.status,
    estimatedDeliveryAt: row.estimated_delivery_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    noteToBuyer: row.note_to_buyer ?? undefined,
    updates,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrder(row: OrderRow): Order {
  const buyer = one(row.buyer);
  const seller = one(row.seller);
  // The seller may re-issue a shipment; the most recently updated row wins.
  const shipmentRow = (row.shipment ?? [])
    .slice()
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0];
  return {
    id: row.id,
    reference: row.reference,
    buyerId: row.buyer_id,
    buyerName: buyer?.full_name ?? '',
    sellerId: row.seller_id,
    sellerName: seller?.display_name ?? '',
    sellerVerified: seller?.status === 'verified',
    cityId: row.city_id ?? undefined,
    items: (row.items ?? []).map((i) => mapItem(i, row.id)),
    subtotal: Number(row.subtotal),
    currency: row.currency,
    status: row.status,
    statusHistory: (row.status_history ?? [])
      .map((s) => mapStatusEvent(s, row.id))
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    shipment: shipmentRow ? mapShipment(shipmentRow, row.id) : undefined,
    estimatedDeliveryAt: row.estimated_delivery_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    issueNote: row.issue_note ?? undefined,
    placedAt: row.placed_at,
    updatedAt: row.updated_at,
  };
}

/* ------------------------------------------------------------------ *
 * Public API (mock/live aware)
 * ------------------------------------------------------------------ */

/** Orders the signed-in user has placed as a buyer, newest first. */
export async function fetchMyOrders(): Promise<Order[]> {
  if (env.useMocks || !supabase) {
    return delay(selectBuyerOrders(useOrdersStore.getState().orders));
  }
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('buyer_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as OrderRow[] | null) ?? []).map(mapOrder);
}

/** A single order with items, status history and shipment tracking. */
export async function fetchOrder(id: string): Promise<Order | null> {
  if (env.useMocks || !supabase) {
    return delay(useOrdersStore.getState().getById(id) ?? null);
  }
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data as unknown as OrderRow) : null;
}

/**
 * Place an order for a listing.
 *
 * Live: calls the `place_order` SECURITY DEFINER RPC, which validates the
 * caller, snapshots the price server-side (the client cannot tamper with the
 * amount), generates the reference and inserts the order + line item + initial
 * status in one transaction. Mock: builds an Order from the listing and adds it
 * to the in-memory store so it appears immediately in the buyer's orders.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const quantity = Math.max(1, Math.floor(input.quantity || 1));

  if (env.useMocks || !supabase) {
    const listing = getListingById(input.listingId);
    if (!listing || listing.status !== 'active') throw new ListingUnavailableError();
    const at = new Date().toISOString();
    const id = `ord-local-${Date.now()}`;
    const ref = `SQ-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const order: Order = {
      id,
      reference: ref,
      buyerId: CURRENT_USER_ID,
      buyerName: 'You',
      sellerId: listing.seller?.id ?? listing.sellerId,
      sellerName: listing.seller?.displayName ?? '',
      sellerVerified: listing.seller?.status === 'verified',
      cityId: listing.cityId,
      items: [
        {
          id: `oi-${id}`,
          orderId: id,
          listingId: listing.id,
          title: listing.title,
          imageUrl: listing.images[0],
          unitPrice: listing.price,
          currency: listing.currency,
          quantity,
        },
      ],
      subtotal: listing.price * quantity,
      currency: listing.currency,
      status: 'pending',
      statusHistory: [{ id: `sh-${id}`, orderId: id, status: 'pending', createdAt: at }],
      placedAt: at,
      updatedAt: at,
    };
    useOrdersStore.getState().addOrder(order);
    return delay(order);
  }

  const { data, error } = await supabase.rpc('place_order', {
    p_listing_id: input.listingId,
    p_quantity: quantity,
  });
  if (error) {
    if (error.message?.includes('auth_required')) throw new CheckoutAuthError();
    if (
      error.message?.includes('listing_unavailable') ||
      error.message?.includes('listing_not_found') ||
      error.message?.includes('cannot_buy_own_listing')
    ) {
      throw new ListingUnavailableError(error.message);
    }
    throw error;
  }
  const orderId = data as string;
  const order = await fetchOrder(orderId);
  if (!order) throw new Error('Order placed but could not be loaded.');
  return order;
}

/**
 * Buyer raises an issue on an order (moderation-friendly: the order is kept,
 * not deleted). Live: updates the order status + issue note (RLS allows the
 * buyer to update their own order) and appends a status-history row.
 */
export async function reportOrderIssue(orderId: string, note: string): Promise<void> {
  const trimmed = note.trim();
  if (env.useMocks || !supabase) {
    useOrdersStore.getState().reportIssue(orderId, trimmed);
    await delay(null);
    return;
  }
  const { error } = await supabase
    .from('orders')
    .update({ status: 'issue_reported', issue_note: trimmed })
    .eq('id', orderId);
  if (error) throw error;
  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert({ order_id: orderId, status: 'issue_reported', note: trimmed });
  if (historyError) throw historyError;
}
