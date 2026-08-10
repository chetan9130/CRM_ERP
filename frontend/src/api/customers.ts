import apiClient from './client';
import type { Customer, CustomerNote } from '../types';

export interface GetCustomersResponse {
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CustomerParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customer_type?: string;
}

export const customersApi = {
  getCustomers: async (params?: CustomerParams): Promise<GetCustomersResponse> => {
    const response = await apiClient.get<GetCustomersResponse>('/customers', { params });
    return response.data;
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    const response = await apiClient.post<Customer>('/customers', customer);
    return response.data;
  },

  updateCustomer: async (id: string, customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    const response = await apiClient.put<Customer>(`/customers/${id}`, customer);
    return response.data;
  },

  deleteCustomer: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/customers/${id}`);
    return response.data;
  },

  getCustomerNotes: async (customerId: string): Promise<CustomerNote[]> => {
    const response = await apiClient.get<CustomerNote[]>(`/customers/${customerId}/notes`);
    return response.data;
  },

  addCustomerNote: async (customerId: string, note: string): Promise<CustomerNote> => {
    const response = await apiClient.post<CustomerNote>(`/customers/${customerId}/notes`, { note });
    return response.data;
  }
};
