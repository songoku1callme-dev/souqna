/**
 * Core domain types. These intentionally mirror the Supabase schema in
 * `supabase/schema.sql` so the same shapes flow from DB → API helpers → UI.
 */

export type UserRole = 'buyer' | 'seller' | 'admin';
export type RoleInterest = 'buyer' | 'seller' | 'both';

export type SellerStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export type ListingCondition = 'new' | 'like_new' | 'good' | 'used';
export type ListingStatus = 'draft' | 'active' | 'sold' | 'removed' | 'under_review';

export type CategorySlug =
  | 'clothing'
  | 'electronics'
  | 'home'
  | 'beauty'
  | 'kids'
  | 'services'
  | 'misc';

export type LocalizedText = {
  en: string;
  ar: string;
};

export type City = {
  id: string;
  countryCode: string;
  name: LocalizedText;
  postalPrefix?: string;
};

export type Category = {
  id: string;
  slug: CategorySlug;
  /** Ionicons name used for chips and grids. */
  icon: string;
};

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  roles: UserRole[];
  cityId?: string;
  postalCode?: string;
  createdAt: string;
};

export type SellerProfile = {
  id: string;
  userId: string;
  displayName: string;
  legalName?: string;
  phone?: string;
  email?: string;
  cityId?: string;
  postalCode?: string;
  categorySlugs: CategorySlug[];
  status: SellerStatus;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt: string;
};

/** The current user's own verification request (used to surface rejection reasons). */
export type VerificationRequest = {
  id: string;
  status: SellerStatus;
  reviewerNotes?: string;
  createdAt: string;
};

/** A pending verification request shown in the admin moderation queue. */
export type PendingVerification = {
  id: string;
  sellerProfileId: string;
  userId: string;
  displayName: string;
  legalName?: string;
  cityId?: string;
  documentPaths: string[];
  createdAt: string;
};

export type ListingImage = {
  id: string;
  listingId: string;
  url: string;
  position: number;
};

export type Listing = {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  categorySlug: CategorySlug;
  price: number;
  currency: string;
  condition: ListingCondition;
  cityId: string;
  postalCode?: string;
  images: string[];
  delivery: boolean;
  pickup: boolean;
  status: ListingStatus;
  createdAt: string;
  /** Denormalized for cards/detail; resolved from sellerId in mock + queries. */
  seller?: SellerSummary;
};

export type SellerSummary = {
  id: string;
  displayName: string;
  status: SellerStatus;
  cityId?: string;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt: string;
};

export type Conversation = {
  id: string;
  listingId?: string;
  listingTitle?: string;
  participantName: string;
  participantId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  verified: boolean;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type ReportReason = 'spam' | 'prohibited' | 'scam' | 'offensive' | 'other';
export type ReportTargetType = 'listing' | 'user' | 'conversation';

export type Report = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
  createdAt: string;
};

/* ------------------------------------------------------------------ *
 * Orders & shipment tracking
 * Mirrors the orders/order_items/order_status_history/shipments/
 * shipment_updates tables in supabase/schema.sql. RLS-aware and built so
 * any local courier can be entered manually (no carrier hardcoding).
 * ------------------------------------------------------------------ */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'issue_reported';

/** Order lifecycle in display order; cancelled/issue_reported are terminal off-ramps. */
export const ORDER_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export type ShipmentStatus =
  | 'pending'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception';

export type OrderItem = {
  id: string;
  orderId: string;
  listingId: string;
  title: string;
  imageUrl?: string;
  unitPrice: number;
  currency: string;
  quantity: number;
};

export type OrderStatusEvent = {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
};

export type ShipmentUpdate = {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  description?: string;
  createdAt: string;
};

export type Shipment = {
  id: string;
  orderId: string;
  /** Manually entered local courier (e.g. a regional logistics company). */
  courierName?: string;
  /** Optional shipping provider/brand name. */
  provider?: string;
  trackingNumber?: string;
  /** External tracking link; may be the only tracking signal available. */
  trackingUrl?: string;
  status: ShipmentStatus;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  noteToBuyer?: string;
  updates: ShipmentUpdate[];
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  /** Human-friendly reference shown to users, e.g. SQ-2026-0008. */
  reference: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  cityId?: string;
  items: OrderItem[];
  subtotal: number;
  currency: string;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  shipment?: Shipment;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  /** Free-text issue raised by the buyer; keeps order flows moderation-friendly. */
  issueNote?: string;
  placedAt: string;
  updatedAt: string;
};

export type SortOption = 'newest' | 'price_low' | 'price_high' | 'nearest';

export type ListingFilters = {
  query?: string;
  categorySlug?: CategorySlug | null;
  cityId?: string | null;
  postalCode?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  condition?: ListingCondition | null;
  verifiedOnly?: boolean;
  sort?: SortOption;
};
