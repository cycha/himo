import axios, { AxiosInstance } from 'axios';
import type { AuthResponse, SearchFilters, SearchResponse, LoginForm, SignupForm, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginForm): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/users/login', data);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  }

  async signup(data: SignupForm): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/users/signup', data);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  }

  async getProfile(): Promise<{ success: boolean; data: User }> {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  // Ad endpoints
  async searchAds(filters: SearchFilters): Promise<SearchResponse> {
    const response = await this.client.post<SearchResponse>('/ads/search', filters);
    return response.data;
  }

  async getAdById(id: string): Promise<{ success: boolean; data: any }> {
    const response = await this.client.get(`/ads/${id}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export const api = new ApiClient();
export default api;
