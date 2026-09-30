export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "FARMER"
  | "FPO_ADMIN"
  | "BUYER"
  | "TRADER"
  | "RETAILER"
  | "RESTAURANT"
  | "TRANSPORTER"
  | "MARKET_MANAGER";

export type SelfRegisterRole = "FARMER" | "BUYER" | "TRADER" | "RETAILER" | "RESTAURANT" | "TRANSPORTER";
export type Unit = "KG" | "QUINTAL" | "TONNE" | "PIECE" | "BUNDLE" | "CRATE";
export type QualityGrade = "A" | "B" | "C";
export type ListingStatus = "DRAFT" | "ACTIVE" | "PARTIALLY_SOLD" | "SOLD" | "EXPIRED" | "CANCELLED";
export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED" | "EXPIRED" | "CANCELLED";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";
export type PaymentStatus = "PENDING" | "AUTHORIZED" | "SUCCESS" | "FAILED" | "REFUNDED" | "PARTIAL_REFUND";
export type OrderPaymentStatus = "UNPAID" | "PENDING" | "PARTIALLY_PAID" | "PAID" | "REFUNDED" | "FAILED";
export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "RAZORPAY";
export type DeliveryStatus = "REQUESTED" | "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type BusinessType = "WHOLESALER" | "TRADER" | "RETAILER" | "RESTAURANT" | "HOTEL" | "PROCESSOR";
export type MarketType = "MANDI" | "KRISHAK_BAZAR" | "WHOLESALE_MARKET" | "RETAIL_MARKET" | "COLLECTION_CENTER";
export type VehicleType = "PICKUP" | "MINI_TRUCK" | "TRUCK" | "THREE_WHEELER" | "TRACTOR";
export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
export type RequirementStatus = "OPEN" | "FULFILLED" | "EXPIRED" | "CANCELLED";

export interface GeoPoint {
  type: "Point";
  coordinates: number[];
}

export interface GeoInput {
  longitude: number;
  latitude: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

export interface PageQuery {
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
  sortBy?: string;
  q?: string;
  status?: string;
}

export interface ApiFailureBody {
  success: false;
  message?: string;
  error?: {
    code?: string;
    details?: Array<{ path?: string; message: string }>;
  };
}

export interface User {
  _id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: Role;
  roles: string[];
  profileImage: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  isDemo?: boolean;
  lastLoginAt?: string | null;
  address: string | null;
  village: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  location: GeoPoint | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface FarmerProfile {
  _id: string;
  userId: string;
  farmerName: string | null;
  farmName: string | null;
  fatherName: string | null;
  phone: string | null;
  address: string | null;
  village: string | null;
  gramPanchayat: string | null;
  block: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  location: GeoPoint | null;
  farmSize: number | null;
  farmSizeUnit: string | null;
  primaryCrops: string[];
  farmingType: string | null;
  bankDetails: {
    accountHolderName: string | null;
    accountNumberMasked: string | null;
    ifsc: string | null;
    bankName: string | null;
    branch: string | null;
  } | null;
  documents: unknown[];
  verificationStatus: VerificationStatus;
  rating: number;
  ratingCount: number;
  totalOrders: number;
  totalSales: number;
  isVerified: boolean;
  distanceMeters?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuyerProfile {
  _id: string;
  userId: string;
  businessName: string | null;
  businessType: BusinessType | string;
  ownerName: string | null;
  phone: string | null;
  email: string | null;
  gstNumber: string | null;
  address: string | null;
  village: string | null;
  block: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  markets: string[];
  preferredCrops: string[];
  buyingCapacity: number | null;
  buyingCapacityUnit?: string;
  paymentTerms: string | null;
  location: GeoPoint | null;
  verificationStatus: VerificationStatus;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  documents?: unknown[];
  distanceMeters?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Fpo {
  _id: string;
  name: string | null;
  registrationNumber: string | null;
  description: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  village: string | null;
  block: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  location: GeoPoint | null;
  memberCount: number;
  memberFarmerIds: string[];
  primaryCrops: string[];
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  documents: unknown[];
  adminUserId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Market {
  _id: string;
  name: string | null;
  marketCode: string | null;
  marketType: MarketType | string;
  address: string | null;
  village: string | null;
  block: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  location: GeoPoint | null;
  operatingDays: string[];
  openingTime: string | null;
  closingTime: string | null;
  commodities: string[];
  commissionRate: number;
  isActive: boolean;
  isDemo?: boolean;
  distanceMeters?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Crop {
  _id: string;
  name: string | null;
  localNames: string[];
  bengaliName: string | null;
  category: string;
  unit: Unit | string;
  image: string | null;
  description: string | null;
  season: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Place {
  address?: string | null;
  landmark?: string | null;
  location?: GeoPoint | null;
}

export interface Listing {
  _id: string;
  farmerId: string;
  farmerProfileId: string | null;
  fpoId: string | null;
  cropId: string;
  title: string | null;
  description: string | null;
  quantity: number;
  availableQuantity: number;
  unit: Unit | string;
  qualityGrade: QualityGrade | string;
  qualityParameters: Record<string, unknown>;
  expectedPrice: number | null;
  minimumPrice: number | null;
  harvestDate: string;
  availableFrom: string;
  availableUntil: string;
  location: GeoPoint | null;
  pickupLocation: Place | null;
  preferredMarketId: string | null;
  district: string | null;
  state: string | null;
  images: string[];
  status: ListingStatus | string;
  isNegotiable: boolean;
  allowBidding: boolean;
  distanceMeters?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListingInput {
  cropId: string;
  fpoId?: string;
  title?: string;
  description?: string;
  quantity: number;
  unit: Unit;
  qualityGrade: QualityGrade;
  expectedPrice: number;
  minimumPrice?: number;
  harvestDate: string;
  availableFrom: string;
  availableUntil: string;
  marketId?: string;
  preferredMarketId?: string;
  location?: GeoInput;
  pickupLocation?: { address: string; landmark?: string; longitude: number; latitude: number };
  images?: string[];
  isNegotiable?: boolean;
  allowBidding?: boolean;
  district?: string;
  state?: string;
}

export interface ListingQuery extends PageQuery {
  crop?: string;
  cropId?: string;
  marketId?: string;
  district?: string;
  farmer?: string;
  farmerId?: string;
  fpo?: string;
  fpoId?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  quality?: QualityGrade;
  qualityGrade?: QualityGrade;
  availableFrom?: string;
  availableUntil?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface Offer {
  _id: string;
  listingId: string;
  buyerId: string;
  farmerId: string;
  offeredPrice: number | null;
  quantity: number;
  originalPrice: number | null;
  originalQuantity: number | null;
  message: string | null;
  status: OfferStatus | string;
  lastCounteredBy: string | null;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Requirement {
  _id: string;
  buyerId: string;
  buyerProfileId: string | null;
  cropId: string;
  quantity: number;
  fulfilledQuantity: number;
  unit: Unit | string;
  targetPrice: number | null;
  qualityGrade: QualityGrade | string | null;
  requiredDate: string;
  marketId: string | null;
  district: string | null;
  state: string | null;
  location: GeoPoint | null;
  notes: string | null;
  status: RequirementStatus | string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  orderNumber: string | null;
  buyerId: string;
  farmerId: string;
  fpoId: string | null;
  listingId: string;
  offerId: string | null;
  cropId: string;
  quantity: number;
  unit: Unit | string;
  unitPrice: number | null;
  subtotal: number | null;
  commission: number | null;
  transportCharge: number | null;
  tax: number | null;
  discount: number | null;
  totalAmount: number | null;
  pickupLocation: Place | null;
  deliveryLocation: Place | null;
  marketId: string | null;
  scheduledPickupDate: string | null;
  scheduledDeliveryDate: string | null;
  paymentStatus: OrderPaymentStatus | string;
  orderStatus: OrderStatus | string;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  buyerId: string;
  amount: number | null;
  currency: string;
  method: PaymentMethod | string;
  provider: string;
  transactionId: string | null;
  providerOrderId: string | null;
  status: PaymentStatus | string;
  paidAt: string | null;
  refundedAmount: number;
  metadata: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentCreateResult {
  payment: Payment;
  providerPayload: Record<string, unknown>;
}

export interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleType: VehicleType | string;
  capacity: number;
  driverName: string;
  driverPhone: string;
}

export interface TransporterProfile {
  _id: string;
  userId: string;
  businessName: string | null;
  phone: string | null;
  vehicleTypes: string[];
  vehicles: Vehicle[];
  serviceAreas: Array<{ district: string; state?: string }>;
  location: GeoPoint | null;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  rating: number;
  ratingCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrackingEvent {
  status: string;
  note?: string;
  at?: string;
  actorId?: string;
}

export interface Delivery {
  _id: string;
  orderId: string;
  transporterId: string | null;
  vehicleId: string | null;
  pickupLocation: Place | null;
  dropLocation: Place | null;
  scheduledPickup: string | null;
  scheduledDelivery: string | null;
  distance: number | null;
  estimatedCost: number;
  actualCost: number | null;
  status: DeliveryStatus | string;
  trackingEvents: TrackingEvent[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketPrice {
  _id: string;
  cropId: string;
  marketId: string;
  date: string;
  minimumPrice: number | null;
  maximumPrice: number | null;
  modalPrice: number | null;
  unit: string;
  source: string;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppNotification {
  _id: string;
  channel: string;
  event: string;
  title: string | null;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  readAt: string | null;
  status?: string;
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  participants: string[];
  listingId: string | null;
  orderId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  message: string | null;
  messageType: string;
  attachments: string[];
  isRead: boolean;
  readAt: string | null;
  createdAt?: string;
}

export interface Review {
  _id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dispute {
  _id: string;
  orderId: string;
  raisedBy: string;
  against: string;
  reason: string | null;
  description: string | null;
  images: string[];
  status: DisputeStatus | string;
  resolution: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentRecord {
  _id: string;
  fileUrl: string | null;
  fileKey: string | null;
  fileName: string | null;
  mimeType: string | null;
  uploadedBy: string;
  documentType: string;
  ownerType: string;
  ownerId: string | null;
  storage?: string;
  createdAt?: string;
}

export interface BuyerMatch {
  requirement: Requirement;
  matchingListings: Listing[];
  marketPrices: MarketPrice[];
}

export interface FarmerMatch {
  listing: Listing;
  matchingRequirements: Requirement[];
  nearbyBuyers: BuyerProfile[];
  nearbyMarkets: Market[];
  marketPrices: MarketPrice[];
}

export interface MatchResult {
  farmerMatches: FarmerMatch[];
  buyerMatches: BuyerMatch[];
}

export interface AdminDashboard {
  totalFarmers: number;
  activeFarmers: number;
  totalBuyers: number;
  activeBuyers: number;
  totalListings: number;
  activeListings: number;
  todaysOrders: number;
  totalGmv: number;
  pendingPayments: number;
  completedOrders: number;
  activeDeliveries: number;
  topVegetables: Array<{ cropId: string; name: string | null; volume: number; gmv: number }>;
  topMarkets: Array<{ marketId: string; name: string | null; orders: number; gmv: number }>;
}

export interface AuditLog {
  _id: string;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  oldValue: unknown;
  newValue: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt?: string;
}
