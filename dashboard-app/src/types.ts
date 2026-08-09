export type TabType = 'feedback' | 
  | 'dashboard'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'return_product'
  | 'coupons'
  | 'analytics'
  | 'reports'
  | 'help'
  | 'settings';

export type LoyaltyTier = 'Black' | 'Platinum' | 'Golden' | 'Silver';

export type OrderStatus = 'Delivered' | 'In Transit' | 'Processing' | 'Returned' | 'Cancelled';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'First Citizen Pay' | 'Store Card' | 'COD';

export type ReturnReason = 'Damaged' | 'Wrong Size' | 'Wrong Product' | 'Customer Changed Mind' | 'Other';

export type ReturnStatus = 'Pending Inspection' | 'Approved' | 'Rejected';

export interface ReturnRecord {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  sku?: string;
  quantity: number;
  reason: ReturnReason;
  refundAmount: number;
  returnDate: string;
  status: ReturnStatus;
  restockInventory: boolean;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  loyaltyTier: LoyaltyTier;
  storeLocation: string;
  date: string;
  time: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  shippingAddress: string;
  trackingNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  totalSpent: number;
  totalOrders: number;
  lastPurchaseDate: string;
  preferredCategory: string;
  joinedDate: string;
  avatar: string;
  storeLocation?: string;
  checkedInAt?: string; // ISO timestamp — drives newest-first sorting & new-arrival detection
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  department: 'Menswear' | 'Womenswear' | 'Beauty & Perfumes' | 'Luxury Watches' | 'Kids' | 'Home & Living' | 'Handbags & Accessories' | 'Footwear';
  stock: number;
  minThreshold: number;
  lowStockThreshold?: number;
  price: number;
  costPrice: number;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
  image: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  couponCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  loyaltyTier: LoyaltyTier;
  orderId: string;
  orderTotal: number;
  discountSaved: number;
  redeemedAt: string;
  storeLocation: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'Percentage' | 'Flat Amount';
  discountValue: number;
  minOrderValue: number;
  usageCount: number;
  maxUsage: number;
  status: 'Active' | 'Scheduled' | 'Expired';
  startDate: string;
  endDate: string;
  applicableCategory: string;
  redemptions?: CouponRedemption[];
}

export interface ReportItem {
  id: string;
  title: string;
  category: 'Financial' | 'Sales' | 'Inventory' | 'Tax GST' | 'Customer Loyalty' | 'Customer Details' | 'Coupon Analytics' | 'Customer Reviews' | 'Returns Audit';
  generatedDate: string;
  fileSize: string;
  fileFormat: 'PDF' | 'XLSX' | 'CSV';
  downloadUrl: string;
  description?: string;
  recordCount?: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'POS Terminal' | 'Inventory Sync' | 'Billing / GST' | 'Loyalty System';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  assignedTo: string;
}

export interface MetricCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
  iconName: string;
}
