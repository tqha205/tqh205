import { Product, User, UserRole, Order, AuthResponse, Review, Coupon } from '../types';

// Initial Mock Data with VND prices and stable images
// Optimized images: w=800 for listing, q=80 for quality/compression
const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'iPhone 15 Pro Max', 
    brand: 'Apple', 
    price: 32990000, 
    originalPrice: 34990000,
    category: 'Smartphone', 
    stock: 10, 
    // Natural Titanium look
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    description: 'iPhone 15 Pro Max sở hữu thiết kế titan bền bỉ và nhẹ, các cạnh viền bo cong mới, nút Tác vụ (Action button) mới, nâng cấp camera mạnh mẽ và chip A17 Pro cho hiệu suất chơi game di động đỉnh cao.',
    features: ['Chip A17 Pro', 'Thiết kế Titan', 'Camera chính 48MP | Siêu rộng | Tele', 'Xem video lên đến 29 giờ'],
    reviews: [
      { id: 'r1', userName: 'Nguyễn Văn A', rating: 5, comment: 'Sản phẩm quá tuyệt vời, pin trâu, camera nét.', date: '2023-10-20' },
      { id: 'r2', userName: 'Trần Thị B', rating: 4, comment: 'Màu titan tự nhiên nhìn ngoài rất đẹp.', date: '2023-10-22' }
    ],
    promotion: 'Giảm ngay 2.000.000đ khi thanh toán qua QR Code ngân hàng',
    discountAmount: 2000000,
    discountCondition: 'banking'
  },
  { 
    id: '2', 
    name: 'Samsung Galaxy S24 Ultra', 
    brand: 'Samsung', 
    price: 28990000, 
    originalPrice: 31990000,
    category: 'Smartphone', 
    stock: 15, 
    // Titanium Grey/Sleek look
    image: 'https://images.unsplash.com/photo-1713603706443-4b6842750d18?auto=format&fit=crop&q=80&w=800',
    description: 'Khai phá những cấp độ mới của sự sáng tạo, năng suất và khả năng với Galaxy S24 Ultra. Chiếc điện thoại mở ra kỷ nguyên mới của AI trên thiết bị di động.',
    features: ['Snapdragon 8 Gen 3', 'Camera góc rộng 200MP', 'Khung viền Titan', 'Tính năng Galaxy AI'],
    reviews: [],
    promotion: 'Giảm sốc 3 triệu đồng',
    discountAmount: 0,
    discountCondition: 'all'
  },
  { 
    id: '3', 
    name: 'Google Pixel 8 Pro', 
    brand: 'Google', 
    price: 23490000, 
    originalPrice: 24990000, 
    category: 'Smartphone', 
    stock: 8, 
    // Porcelain/White look
    image: 'https://images.unsplash.com/photo-1701625936746-13a8120e3678?auto=format&fit=crop&q=80&w=800',
    description: 'Gặp gỡ Pixel 8 Pro, chiếc điện thoại chuyên nghiệp được thiết kế bởi Google. Kiểu dáng đẹp, tinh tế và mạnh mẽ, trang bị chip Google Tensor G3 mới.',
    features: ['Google Tensor G3', 'Màn hình Super Actua', 'Điều khiển camera chuyên nghiệp', 'Tính năng Best Take'],
    reviews: [],
    discountAmount: 1500000,
    discountCondition: 'all',
    promotion: 'Giảm 1.500.000đ cho khách hàng mới'
  },
  { 
    id: '4', 
    name: 'Xiaomi 14 Ultra', 
    brand: 'Xiaomi', 
    price: 29990000, 
    originalPrice: 32990000,
    category: 'Smartphone', 
    stock: 20, 
    // High-end camera focus
    image: 'https://images.unsplash.com/photo-1710599554743-3453b3b4f697?auto=format&fit=crop&q=80&w=800',
    description: 'Đồng chế tác cùng Leica, Xiaomi 14 Ultra mang đến trải nghiệm nhiếp ảnh chuyên nghiệp ngay trong túi bạn với hệ thống 4 camera đỉnh cao.',
    features: ['Ống kính Leica Summilux', 'Snapdragon 8 Gen 3', 'Màn hình AMOLED WQHD+ 1-120Hz', 'Sạc siêu nhanh 90W'],
    reviews: [],
    promotion: 'Trả góp 0% lãi suất',
    discountAmount: 0
  },
  { 
    id: '5', 
    name: 'iPhone 14', 
    brand: 'Apple', 
    price: 17990000, 
    originalPrice: 19990000, 
    category: 'Smartphone', 
    stock: 5, 
    // Blue/Purple vibe
    image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=800',
    description: 'iPhone 14. Với hệ thống camera kép ấn tượng nhất trên iPhone. Chụp ảnh tuyệt đẹp trong cả điều kiện ánh sáng yếu và ánh sáng mạnh.',
    features: ['Chip A15 Bionic', 'Màn hình Super Retina XDR', 'Chế độ điện ảnh (Cinematic)', 'Phát hiện va chạm'],
    reviews: [],
    discountAmount: 1000000,
    discountCondition: 'all',
    promotion: 'Xả kho giảm 1 triệu'
  },
  { 
    id: '6', 
    name: 'Samsung Z Fold 5', 
    brand: 'Samsung', 
    price: 35990000, 
    originalPrice: 40990000, 
    category: 'Smartphone', 
    stock: 3, 
    // Foldable concept
    image: 'https://images.unsplash.com/photo-1628148858349-2e6912852528?auto=format&fit=crop&q=80&w=800',
    description: 'Mở ra trải nghiệm giải trí đắm chìm với Màn hình chính 7.6 inch khổng lồ. Đa nhiệm chuyên nghiệp và chơi game với hiệu suất cao.',
    features: ['Thiết kế bản lề Flex', 'Snapdragon 8 Gen 2 for Galaxy', 'Đa nhiệm nhiều cửa sổ', 'Hỗ trợ bút S Pen'],
    reviews: [],
    discountAmount: 5000000,
    discountCondition: 'banking',
    promotion: 'Giảm 5TR khi chuyển khoản'
  },
  { 
    id: '7', 
    name: 'iPhone 13', 
    brand: 'Apple', 
    price: 15990000, 
    originalPrice: 18990000, 
    category: 'Smartphone', 
    stock: 12, 
    // Pink/Red aesthetic
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800', 
    description: 'Hệ thống camera kép tiên tiến nhất từng có trên iPhone. Chip A15 Bionic thần tốc.', 
    features: ['Camera góc rộng mới', 'Thời lượng pin lớn', 'Ceramic Shield'], 
    discountAmount: 500000,
    promotion: 'Tặng ốp lưng chính hãng'
  },
  { 
    id: '8', 
    name: 'Samsung Galaxy S23', 
    brand: 'Samsung', 
    price: 16990000, 
    originalPrice: 20990000, 
    category: 'Smartphone', 
    stock: 10, 
    // Cream/Minimalist
    image: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=800', 
    description: 'Thiết kế đối xứng đậm chất Galaxy, sử dụng vật liệu tái chế và thân thiện môi trường.', 
    features: ['Snapdragon 8 Gen 2', 'Camera Nightography', 'Pin bền bỉ'] 
  },
  { 
    id: '9', 
    name: 'Oppo Find X5 Pro', 
    brand: 'Oppo', 
    price: 19990000, 
    category: 'Smartphone', 
    stock: 5, 
    // Sleek black/ceramic
    image: 'https://images.unsplash.com/photo-1649962295551-526487e872d1?auto=format&fit=crop&q=80&w=800', 
    description: 'Đột phá nhiếp ảnh đêm với MariSilicon X. Thiết kế gốm sang trọng.', 
    features: ['MariSilicon X', 'Hasselblad Camera', 'Sạc nhanh SuperVOOC'], 
    discountAmount: 2000000 
  },
  { 
    id: '10', 
    name: 'Xiaomi 13 Pro', 
    brand: 'Xiaomi', 
    price: 14990000, 
    originalPrice: 16990000, 
    category: 'Smartphone', 
    stock: 8, 
    // Modern Xiaomi look
    image: 'https://images.unsplash.com/photo-1677328222934-8b650228723c?auto=format&fit=crop&q=80&w=800', 
    description: 'Kiệt tác nhiếp ảnh di động. Màn hình AMOLED 120Hz siêu mượt.', 
    features: ['Camera Leica', 'Snapdragon 8 Gen 2', 'Màn hình cong 3D'] 
  },
  { 
    id: '11', 
    name: 'Vivo X90', 
    brand: 'Vivo', 
    price: 18990000, 
    category: 'Smartphone', 
    stock: 4, 
    // Vibrant Blue
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=800', 
    description: 'X90 Series định hình lại chuẩn mực nhiếp ảnh chân dung chuyên nghiệp.', 
    features: ['Zeiss T* Coating', 'Dimensity 9200', 'Sạc nhanh 120W'] 
  },
  { 
    id: '12', 
    name: 'Realme GT 3', 
    brand: 'Realme', 
    price: 12990000, 
    category: 'Smartphone', 
    stock: 15, 
    // Gaming/Tech vibe
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800', 
    description: 'Tốc độ sạc nhanh nhất thế giới 240W. Thiết kế đèn LED RGB độc đáo ở mặt lưng.', 
    features: ['Sạc nhanh 240W', 'Snapdragon 8+ Gen 1', 'Màn hình 144Hz'], 
    discountAmount: 900000 
  },
];

const INITIAL_COUPONS: Coupon[] = [
    { code: 'WELCOME', discount: 200000, description: 'Giảm 200k cho thành viên mới' },
    { code: 'MEMBER500', discount: 500000, description: 'Giảm 500k cho đơn từ 10tr' }
];

const GOLD_COUPON: Coupon = { code: 'GOLD_MEMBER', discount: 500000, description: 'Đặc quyền thành viên Vàng' };
const DIAMOND_COUPON: Coupon = { code: 'DIAMOND_MEMBER', discount: 1000000, description: 'Đặc quyền thành viên Kim Cương' };


const INITIAL_USERS: User[] = [
  { id: '1', name: 'Quản Trị Viên', username: 'admin', role: UserRole.ADMIN, password: '123' },
  { 
    id: '2', 
    name: 'Khách Hàng', 
    username: 'client', 
    role: UserRole.CUSTOMER, 
    password: '123', 
    coupons: [...INITIAL_COUPONS],
    tier: 'silver',
    points: 0 
  },
  { id: '3', name: 'Nhân Viên', username: 'staff', role: UserRole.STAFF, password: '123' },
];

const INITIAL_ORDERS: Order[] = [
  { 
    id: 'ord-1', 
    userId: '2', 
    customerName: 'Khách Hàng',
    customerInfo: {
      name: 'Khách Hàng',
      phone: '0901234567',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      birthYear: '1995'
    },
    paymentMethod: 'cod',
    items: [{...INITIAL_PRODUCTS[0], quantity: 1}], 
    total: 34990000, 
    status: 'delivered', 
    date: '2023-10-15',
    rating: 5,
    feedback: 'Sản phẩm tuyệt vời, giao hàng nhanh chóng! Đóng gói rất cẩn thận, mình rất hài lòng.'
  },
  { 
    id: 'ord-2', 
    userId: '2', 
    customerName: 'Khách Hàng',
    customerInfo: {
      name: 'Khách Hàng',
      phone: '0901234567',
      address: '456 Đường XYZ, Quận 3, TP.HCM',
      birthYear: '1995'
    },
    paymentMethod: 'banking',
    items: [{...INITIAL_PRODUCTS[2], quantity: 2}], 
    total: 49980000, 
    status: 'pending', 
    date: '2023-10-20' 
  },
];

// Simulating a delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

class MockService {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private users: User[] = [...INITIAL_USERS];
  private orders: Order[] = [...INITIAL_ORDERS];

  // Helper to calculate spending
  async getUserTotalSpending(userId: string): Promise<number> {
    const userOrders = this.orders.filter(o => o.userId === userId && o.status === 'delivered');
    return userOrders.reduce((acc, curr) => acc + curr.total, 0);
  }

  // Update Tier based on spending and award coupons
  private updateUserTier(user: User, totalSpent: number): User {
      let newTier: 'silver' | 'gold' | 'diamond' = 'silver';
      if (totalSpent >= 50000000) newTier = 'diamond';
      else if (totalSpent >= 10000000) newTier = 'gold';

      // Update Tier
      if (user.tier !== newTier) {
          user.tier = newTier;
      }

      // Initialize coupons if needed
      if (!user.coupons) {
          user.coupons = [];
      }

      const hasCoupon = (code: string) => user.coupons!.some(c => c.code === code);

      // Gold Level Logic (Gold & Diamond users get Gold coupon)
      if (newTier === 'gold' || newTier === 'diamond') {
          if (!hasCoupon(GOLD_COUPON.code)) {
              user.coupons.push(GOLD_COUPON);
          }
      }

      // Diamond Level Logic (Only Diamond users get Diamond coupon)
      if (newTier === 'diamond') {
          if (!hasCoupon(DIAMOND_COUPON.code)) {
              user.coupons.push(DIAMOND_COUPON);
          }
      }

      return user;
  }

  // Auth
  async login(username: string, password: string): Promise<AuthResponse> {
    await delay(500);
    let user = this.users.find(u => u.username === username && u.password === password);
    if (!user) throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');

    // Recalculate tier on login (simulating backend logic)
    const spent = await this.getUserTotalSpending(user.id);
    user = this.updateUserTier(user, spent);

    return { user, token: 'fake-jwt-token-' + Date.now() };
  }

  async register(name: string, username: string, password: string): Promise<AuthResponse> {
    await delay(500);
    if (this.users.find(u => u.username === username)) throw new Error('Tên đăng nhập này đã được sử dụng');
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      username,
      password,
      role: UserRole.CUSTOMER,
      coupons: [...INITIAL_COUPONS], // Tặng coupon cho thành viên mới
      tier: 'silver', // Mặc định là hạng Bạc khi đăng ký
      points: 0
    };
    this.users.push(newUser);
    return { user: newUser, token: 'fake-jwt-token-' + Date.now() };
  }

  // Create user (for Admin) - does not return token/login
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    await delay(500);
    if (this.users.find(u => u.username === user.username)) throw new Error('Tên đăng nhập này đã được sử dụng');
    
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      tier: 'silver',
      points: 0
    };
    this.users.push(newUser);
    return newUser;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    await delay(300);
    return [...this.products];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    await delay(200);
    return this.products.find(p => p.id === id);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    await delay(400);
    const newProduct = { 
      ...product, 
      id: Math.random().toString(36).substr(2, 9),
      description: product.description || 'Mô tả đang cập nhật',
      features: product.features || [],
      reviews: []
    };
    // Use unshift instead of push to add the new product to the beginning of the list
    this.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await delay(400);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy sản phẩm');
    this.products[index] = { ...this.products[index], ...data };
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    await delay(400);
    this.products = this.products.filter(p => p.id !== id);
  }

  // Reviews
  async addReview(productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Product> {
    await delay(400);
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex === -1) throw new Error('Không tìm thấy sản phẩm');

    const newReview: Review = {
        ...review,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0]
    };

    const currentReviews = this.products[productIndex].reviews || [];
    const updatedProduct = {
        ...this.products[productIndex],
        reviews: [newReview, ...currentReviews]
    };
    
    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  // Users (Admin)
  async getUsers(): Promise<User[]> {
    await delay(300);
    return [...this.users];
  }

  async deleteUser(id: string): Promise<void> {
    await delay(300);
    this.users = this.users.filter(u => u.id !== id);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    await delay(300);
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Không tìm thấy người dùng');
    // Prevent sensitive updates in mock
    const { password, ...safeData } = data; 
    this.users[index] = { ...this.users[index], ...safeData };
    return this.users[index];
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    await delay(300);
    // Sort orders by date descending (newest first)
    return [...this.orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createOrder(order: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> {
    await delay(1500); // Simulate processing time
    const newOrder: Order = {
      ...order,
      id: 'ord-' + Math.random().toString(36).substr(2, 6),
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async updateOrder(id: string, status: Order['status']): Promise<Order> {
    await delay(400);
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Không tìm thấy đơn hàng');
    this.orders[index] = { ...this.orders[index], status };
    return this.orders[index];
  }
}

export const api = new MockService();