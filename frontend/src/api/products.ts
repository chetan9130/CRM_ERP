import apiClient from './client';
import type { Product, StockMovement } from '../types';

export interface GetProductsResponse {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  low_stock?: boolean;
}

export interface StockAdjustmentData {
  quantity_changed: number;
  movement_type: 'IN' | 'OUT';
  reason: string;
}

export const productsApi = {
  getProducts: async (params?: ProductParams): Promise<GetProductsResponse> => {
    // low_stock is converted to string for query param
    const queryParams = params 
      ? { ...params, low_stock: params.low_stock ? 'true' : undefined }
      : undefined;
    const response = await apiClient.get<GetProductsResponse>('/products', { params: queryParams });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', product);
    return response.data;
  },

  updateProduct: async (id: string, product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  },

  getProductMovements: async (productId: string): Promise<StockMovement[]> => {
    const response = await apiClient.get<StockMovement[]>(`/products/${productId}/movements`);
    return response.data;
  },

  adjustStock: async (productId: string, data: StockAdjustmentData): Promise<Product> => {
    const response = await apiClient.post<Product>(`/products/${productId}/stock`, data);
    return response.data;
  }
};
