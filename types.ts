
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export type MembershipTier = 'silver' | 'gold' | 'diamond';

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  description?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Coupon {
  code: string;
  discount: number;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  warehouseId?: string;
  status: 'Kinh doanh' | 'Ngừng kinh doanh' | 'Hết hàng';
  description?: string;
  features?: string[];
  reviews?: Review[];
  promotion?: string;
  discountAmount?: number;
  discountCondition?: string;
  imeis?: string[];
}

export interface StockReceiptDetail {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  warrantyMonths?: number;
  imeis?: string[];
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  type: 'import' | 'export' | 'audit';
  quantity: number;
  reason: string;
  supplierName?: string;
  date: string;
  performedBy: string;
  imeis?: string[]; 
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  tier?: MembershipTier;
  points?: number;
  coupons?: Coupon[];
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'cod' | 'banking';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    birthYear: string;
  };
  paymentMethod: PaymentMethod;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  rating?: number;
  feedback?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
