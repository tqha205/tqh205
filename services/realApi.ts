import { Product, User, Order, AuthResponse, Review } from '../types';

const API_URL = 'http://localhost:5000/api';

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
      try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || errorText);
      } catch {
          throw new Error(errorText || `HTTP Error: ${response.status}`);
      }
    }
    return response.json();
  }

  // --- AUTH ---

  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return this.handleResponse(res);
  }

  async register(name: string, username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password })
    });
    return this.handleResponse(res);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(user)
    });
    return this.handleResponse(res);
  }

  // --- PRODUCTS ---

  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/products`);
    return this.handleResponse(res);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (res.status === 404) return undefined;
    return this.handleResponse(res);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(product)
    });
    return this.handleResponse(res);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // --- REVIEWS ---

  async addReview(productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Product> {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(review)
    });
    return this.handleResponse(res);
  }

  // --- USERS (ADMIN) ---

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_URL}/users`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  async getUserTotalSpending(userId: string): Promise<number> {
    // Nếu backend chưa có API tính tổng chi tiêu, ta có thể gọi getOrders rồi tính
    // Hoặc gọi endpoint riêng nếu backend hỗ trợ: GET /users/:id/spending
    try {
        const res = await fetch(`${API_URL}/orders/user/${userId}`);
        if (!res.ok) return 0;
        const orders: Order[] = await res.json();
        return orders
            .filter(o => o.status === 'delivered')
            .reduce((acc, curr) => acc + curr.total, 0);
    } catch (error) {
        console.error('Error calculating spending:', error);
        return 0;
    }
  }

  // --- ORDERS ---

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_URL}/orders`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async createOrder(order: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(order)
    });
    return this.handleResponse(res);
  }

  async updateOrder(id: string, status: Order['status']): Promise<Order> {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(res);
  }
}

export const api = new RealApiService();
