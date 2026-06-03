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
