
import { Product, User, UserRole, Order, AuthResponse, Review, InventoryLog, Supplier } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'iPhone 15 Pro Max', 
    brand: 'Apple', 
    price: 32990000, 
    originalPrice: 34990000,
    category: 'Smartphone', 
    stock: 10, 
    status: 'Kinh doanh',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    description: 'iPhone 15 Pro Max sở hữu thiết kế titan bền bỉ và nhẹ...',
    features: ['Chip A17 Pro', 'Thiết kế Titan'],
    imeis: ['359821012345678', '359821012345679']
  },
  { 
    id: '2', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 28990000, originalPrice: 31990000, category: 'Smartphone', stock: 5, 
    status: 'Kinh doanh',
    image: 'https://images.unsplash.com/photo-1713603706443-4b6842750d18?auto=format&fit=crop&q=80&w=800',
    imeis: ['990000112345678']
  }
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Quản Trị Viên', username: 'admin', role: UserRole.ADMIN, password: '123' },
  { id: '3', name: 'Nhân Viên Kho', username: 'staff', role: UserRole.STAFF, password: '123' },
  { 
    id: 'client', 
    name: 'Khách Hàng', 
    username: 'client', 
    role: UserRole.CUSTOMER, 
    password: '123',
    tier: 'silver',
    points: 0,
    coupons: []
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
    { id: 'sup-1', name: 'Apple Việt Nam', phone: '1800 1127', email: 'contact@apple.com.vn', address: 'Quận 7, TP.HCM' },
    { id: 'sup-2', name: 'Samsung Vina', phone: '1800 588889', email: 'support@samsung.com', address: 'Quận 1, TP.HCM' }
];

const INITIAL_LOGS: InventoryLog[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, Math.min(ms, 300)));

class MockService {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private users: User[] = [...INITIAL_USERS];
  private inventoryLogs: InventoryLog[] = [...INITIAL_LOGS];
  private suppliers: Supplier[] = [...INITIAL_SUPPLIERS];
  private orders: Order[] = [];

  async login(username: string, password: string): Promise<AuthResponse> {
    await delay(200);
    let user = this.users.find(u => u.username === username && u.password === password);
    if (!user) throw new Error('Sai tài khoản');
    return { user, token: 'token-' + Date.now() };
  }

  // Fix: Property 'register' does not exist on type 'MockService'
  async register(name: string, username: string, password: string): Promise<AuthResponse> {
    await delay(200);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      username,
      password,
      role: UserRole.CUSTOMER,
      tier: 'silver',
      points: 0,
      coupons: []
    };
    this.users.push(newUser);
    return { user: newUser, token: 'token-' + Date.now() };
  }

  async getProducts(): Promise<Product[]> { await delay(100); return [...this.products]; }

  // Fix: Property 'createProduct' does not exist on type 'MockService'
  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    await delay(150);
    const newProduct: Product = {
      ...data,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.products.push(newProduct);
    return newProduct;
  }

  // Fix: Property 'deleteProduct' does not exist on type 'MockService'
  async deleteProduct(id: string): Promise<void> {
    await delay(100);
    this.products = this.products.filter(p => p.id !== id);
  }

  // Fix: Property 'updateProduct' does not exist on type 'MockService'
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await delay(150);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy sản phẩm');
    this.products[index] = { ...this.products[index], ...data };
    return this.products[index];
  }

  async getSuppliers(): Promise<Supplier[]> { await delay(100); return [...this.suppliers]; }

  // Fix: Property 'createSupplier' does not exist on type 'MockService'
  async createSupplier(data: Omit<Supplier, 'id'>): Promise<Supplier> {
    await delay(100);
    const newSupplier: Supplier = {
      ...data,
      id: 'sup-' + Math.random().toString(36).substr(2, 5)
    };
    this.suppliers.push(newSupplier);
    return newSupplier;
  }

  // Fix: Property 'updateSupplier' does not exist on type 'MockService'
  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    await delay(100);
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Không tìm thấy nhà cung cấp');
    this.suppliers[index] = { ...this.suppliers[index], ...data };
    return this.suppliers[index];
  }

  // Fix: Property 'deleteSupplier' does not exist on type 'MockService'
  async deleteSupplier(id: string): Promise<void> {
    await delay(100);
    this.suppliers = this.suppliers.filter(s => s.id !== id);
  }

  async getUsers(): Promise<User[]> { await delay(100); return [...this.users]; }

  // Fix: Property 'getUserProfile' does not exist on type 'MockService'
  async getUserProfile(id: string): Promise<User> {
    await delay(100);
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error('Không tìm thấy người dùng');
    return { ...user };
  }

  // Fix: Property 'getUserTotalSpending' does not exist on type 'MockService'
  async getUserTotalSpending(userId: string): Promise<number> {
    await delay(100);
    return this.orders
      .filter(o => o.userId === userId && o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);
  }

  // Fix: Property 'deleteUser' does not exist on type 'MockService'
  async deleteUser(userId: string): Promise<void> {
    await delay(100);
    this.users = this.users.filter(u => u.id !== userId);
  }

  // Fix: Property 'updateUser' does not exist on type 'MockService'
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    await delay(100);
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('Không tìm thấy người dùng');
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  // Fix: Property 'createUser' does not exist on type 'MockService'
  async createUser(data: any): Promise<User> {
    await delay(100);
    const newUser: User = {
      ...data,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.users.push(newUser);
    return newUser;
  }

  // Fix: Property 'getOrders' does not exist on type 'MockService'
  async getOrders(): Promise<Order[]> {
    await delay(100);
    return [...this.orders];
  }

  // Fix: Property 'createOrder' does not exist on type 'MockService'
  async createOrder(orderData: any): Promise<Order> {
    await delay(200);
    const newOrder: Order = {
      ...orderData,
      id: 'ORD-' + Math.floor(Math.random() * 10000).toString(),
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'pending'
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  // Fix: Property 'updateOrder' does not exist on type 'MockService'
  async updateOrder(orderId: string, status: Order['status']): Promise<Order> {
    await delay(100);
    const index = this.orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Không tìm thấy đơn hàng');
    this.orders[index] = { ...this.orders[index], status };
    return this.orders[index];
  }

  // Fix: Property 'addReview' does not exist on type 'MockService'
  async addReview(productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Product> {
    await delay(100);
    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error('Không tìm thấy sản phẩm');
    const prod = this.products[index];
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substr(2, 5),
      date: new Date().toLocaleDateString('vi-VN')
    };
    if (!prod.reviews) prod.reviews = [];
    prod.reviews.unshift(newReview);
    this.products[index] = { ...prod };
    return this.products[index];
  }

  async adjustStock(id: string, quantity: number, type: 'import' | 'export' | 'audit', reason: string, user: string, supplierName?: string, imeis?: string[]): Promise<Product> {
    await delay(150);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy sản phẩm');
    
    const prod = this.products[index];
    let newImeis = [...(prod.imeis || [])];

    if (type === 'import') {
      prod.stock += quantity;
      if (imeis) {
          const uniqueNew = imeis.filter(i => !newImeis.includes(i));
          newImeis = [...newImeis, ...uniqueNew];
      }
      prod.status = 'Kinh doanh';
    } else if (type === 'export') {
      if (prod.stock < quantity) throw new Error(`Sản phẩm ${prod.name} không đủ tồn kho để xuất`);
      prod.stock -= quantity;
      if (imeis) {
          newImeis = newImeis.filter(i => !imeis.includes(i));
      }
      if (prod.stock === 0) prod.status = 'Hết hàng';
    } else if (type === 'audit') {
      prod.stock = quantity;
    }

    prod.imeis = newImeis;
    this.products[index] = { ...prod };

    // Tạo bản ghi lịch sử (InventoryLog)
    const newLog: InventoryLog = {
        id: 'L' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
        productId: id,
        productName: prod.name,
        productImage: prod.image,
        type,
        quantity,
        reason,
        supplierName,
        date: new Date().toISOString(),
        performedBy: user,
        imeis: imeis // Lưu lại danh sách IMEI của phiên giao dịch này
    };
    this.inventoryLogs.unshift(newLog);
    return this.products[index];
  }

  async getInventoryLogs(): Promise<InventoryLog[]> { await delay(100); return [...this.inventoryLogs]; }
}

export const api = new MockService();
