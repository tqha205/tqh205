import { Product, User, Order, AuthResponse, Review } from '../types';
import { api as mockApi } from './mockApi';

const API_URL = 'http://localhost:5000/api';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Custom Error class to carry status codes
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
      let errorMessage = errorText;
      try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorText;
      } catch {}
      
      // Throw custom ApiError with status code
      throw new ApiError(errorMessage || `HTTP Error: ${response.status}`, response.status);
    }
    return response.json();
  }

  // Smart fallback wrapper
  // - Falls back to Mock if Backend is offline or crashing (5xx)
  // - Retains Real Backend error if it's a logic error (4xx like 400 Bad Request, 401 Unauthorized)
  private async withFallback<T>(
    realFn: () => Promise<T>, 
    mockFn: () => Promise<T>, 
    label: string
  ): Promise<T> {
    try {
        return await realFn();
    } catch (error: any) {
        if (error instanceof ApiError) {
            // If it's a Client Error (4xx), e.g., Wrong Password, Duplicate User
            // We want the UI to show the REAL error, not fallback to Mock.
            if (error.status >= 400 && error.status < 500) {
                console.error(`Real API (${label}) Client Error ${error.status}:`, error.message);
                throw error;
            }
        }

        // If Network Error (TypeError) or Server Error (5xx)
        console.warn(`Real API (${label}) unavailable (Network/Server Error). Switching to Mock Data.`);
        return mockFn();
    }
  }

  // --- AUTH ---

  async login(username: string, password: string): Promise<AuthResponse> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return this.handleResponse(res);
        },
        () => mockApi.login(username, password),
        'login'
    );
  }

  async register(name: string, username: string, password: string): Promise<AuthResponse> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, password })
            });
            return this.handleResponse(res);
        },
        () => mockApi.register(name, username, password),
        'register'
    );
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(user)
            });
            return this.handleResponse(res);
        },
        () => mockApi.createUser(user),
        'createUser'
    );
  }

  // --- PRODUCTS ---

  async getProducts(): Promise<Product[]> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/products`);
            return this.handleResponse(res);
        },
        () => mockApi.getProducts(),
        'getProducts'
    );
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/products/${id}`);
            if (res.status === 404) return undefined;
            return this.handleResponse(res);
        },
        () => mockApi.getProduct(id),
        'getProduct'
    );
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(product)
            });
            return this.handleResponse(res);
        },
        () => mockApi.createProduct(product),
        'createProduct'
    );
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return this.handleResponse(res);
        },
        () => mockApi.updateProduct(id, data),
        'updateProduct'
    );
  }

  async deleteProduct(id: string): Promise<void> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return this.handleResponse(res);
        },
        () => mockApi.deleteProduct(id),
        'deleteProduct'
    );
  }

  // --- REVIEWS ---

  async addReview(productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Product> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(review)
            });
            return this.handleResponse(res);
        },
        () => mockApi.addReview(productId, review),
        'addReview'
    );
  }

  // --- USERS (ADMIN) ---

  async getUsers(): Promise<User[]> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/users`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(res);
        },
        () => mockApi.getUsers(),
        'getUsers'
    );
  }

  async deleteUser(id: string): Promise<void> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return this.handleResponse(res);
        },
        () => mockApi.deleteUser(id),
        'deleteUser'
    );
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return this.handleResponse(res);
        },
        () => mockApi.updateUser(id, data),
        'updateUser'
    );
  }

  async getUserTotalSpending(userId: string): Promise<number> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/orders/user/${userId}`);
            // If API not implemented on backend yet (404), return 0 or fallback logic
            if (res.status === 404) return 0; 
            return this.handleResponse(res).then((orders: Order[]) => 
                orders
                .filter(o => o.status === 'delivered')
                .reduce((acc, curr) => acc + curr.total, 0)
            );
        },
        () => mockApi.getUserTotalSpending(userId),
        'getUserTotalSpending'
    );
  }

  // --- ORDERS ---

  async getOrders(): Promise<Order[]> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/orders`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(res);
        },
        () => mockApi.getOrders(),
        'getOrders'
    );
  }

  async createOrder(order: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(order)
            });
            return this.handleResponse(res);
        },
        () => mockApi.createOrder(order),
        'createOrder'
    );
  }

  async updateOrder(id: string, status: Order['status']): Promise<Order> {
    return this.withFallback(
        async () => {
            const res = await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ status })
            });
            return this.handleResponse(res);
        },
        () => mockApi.updateOrder(id, status),
        'updateOrder'
    );
  }
}

export const api = new RealApiService();