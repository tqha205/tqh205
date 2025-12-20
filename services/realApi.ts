
import { Product, User, Order, AuthResponse, Review, InventoryLog, Supplier } from '../types';

const API_URL = 'http://localhost:5000/api';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class RealApiService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(errorText || `Lỗi hệ thống: ${response.status}`, response.status);
    }
    return response.json();
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/login`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ username, password }) 
    });
    return this.handleResponse(res);
  }

  async register(name: string, username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/register`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ name, username, password }) 
    });
    return this.handleResponse(res);
  }

  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/products`);
    return this.handleResponse(res);
  }

  async createProduct(data: Omit<Product, 'id'>): Promise<any> {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<any> {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  async deleteProduct(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_URL}/users`, { headers: this.getHeaders() });
    return this.handleResponse(res);
  }

  async getUserProfile(id: string): Promise<User> {
    const res = await fetch(`${API_URL}/users/${id}`, { headers: this.getHeaders() });
    return this.handleResponse(res);
  }

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_URL}/orders`, { headers: this.getHeaders() });
    return this.handleResponse(res);
  }

  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_URL}/suppliers`, { headers: this.getHeaders() });
    return this.handleResponse(res);
  }

  // Fix: Property 'createSupplier' does not exist on type 'RealApiService'
  async createSupplier(data: Omit<Supplier, 'id'>): Promise<Supplier> {
    const res = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  // Fix: Property 'updateSupplier' does not exist on type 'RealApiService'
  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  // Fix: Property 'deleteSupplier' does not exist on type 'RealApiService'
  async deleteSupplier(id: string): Promise<void> {
    await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  async getInventoryLogs(): Promise<InventoryLog[]> {
    const res = await fetch(`${API_URL}/inventory/logs`, { headers: this.getHeaders() }).catch(() => []);
    return res instanceof Response ? this.handleResponse(res) : [];
  }

  // Fix: Property 'adjustStock' does not exist on type 'RealApiService'
  async adjustStock(id: string, quantity: number, type: 'import' | 'export' | 'audit', reason: string, user: string, supplierName?: string, imeis?: string[]): Promise<Product> {
    const res = await fetch(`${API_URL}/inventory/adjust`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ id, quantity, type, reason, user, supplierName, imeis })
    });
    return this.handleResponse(res);
  }

  async getUserTotalSpending(userId: string): Promise<number> {
    try {
        const orders: Order[] = await this.getOrders();
        return orders
          .filter(o => o.userId === userId && o.status.toLowerCase() === 'delivered')
          .reduce((sum, o) => sum + o.total, 0);
    } catch (e) { return 0; }
  }

  // Cần thiết cho các trang khác
  async createUser(data: any): Promise<User> {
    const res = await fetch(`${API_URL}/users`, { method: 'POST', headers: this.getHeaders(), body: JSON.stringify(data) });
    return this.handleResponse(res);
  }

  async deleteUser(id: string): Promise<void> {
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: this.getHeaders() });
  }

  async updateUser(id: string, data: any): Promise<User> {
    const res = await fetch(`${API_URL}/users/${id}`, { method: 'PATCH', headers: this.getHeaders(), body: JSON.stringify(data) });
    return this.handleResponse(res);
  }

  // Fix: Property 'addReview' does not exist on type 'RealApiService'
  async addReview(productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Product> {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(review)
    });
    return this.handleResponse(res);
  }

  async createOrder(data: any): Promise<Order> {
    const res = await fetch(`${API_URL}/orders`, { method: 'POST', headers: this.getHeaders(), body: JSON.stringify(data) });
    return this.handleResponse(res);
  }

  async updateOrder(id: string, status: string): Promise<any> {
    const res = await fetch(`${API_URL}/orders/${id}`, { method: 'PATCH', headers: this.getHeaders(), body: JSON.stringify({ status }) });
    return this.handleResponse(res);
  }
}

export const api = new RealApiService();
