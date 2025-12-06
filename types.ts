export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export type MembershipTier = 'silver' | 'gold' | 'diamond';

export interface Coupon {
  code: string;
  discount: number;
  description: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  password?: string;
  coupons?: Coupon[];
  tier?: MembershipTier; // Hạng thành viên
  points?: number; // Điểm tích lũy
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
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
  description?: string;
  features?: string[];
  reviews?: Review[];
  promotion?: string;
  discountAmount?: number;
  discountCondition?: 'banking' | 'cod' | 'all';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  address: string;
  birthYear: string;
}

export type PaymentMethod = 'cod' | 'banking';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerInfo: OrderCustomerInfo;
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