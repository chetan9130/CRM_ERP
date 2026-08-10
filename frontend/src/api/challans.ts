import apiClient from './client';
import type { SalesChallan, ChallanItem } from '../types';

export interface GetChallansResponse {
  data: SalesChallan[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ChallanParams {
  page?: number;
  limit?: number;
  status?: string;
  customer_id?: string;
}

export interface ChallanInputItem {
  product_id: string;
  quantity: number;
}

export interface CreateChallanInput {
  customer_id: string;
  items: ChallanInputItem[];
}

export interface ChallanDetailsResponse {
  challan: SalesChallan;
  items: ChallanItem[];
}

export const challansApi = {
  getChallans: async (params?: ChallanParams): Promise<GetChallansResponse> => {
    const response = await apiClient.get<GetChallansResponse>('/challans', { params });
    return response.data;
  },

  getChallan: async (id: string): Promise<ChallanDetailsResponse> => {
    const response = await apiClient.get<ChallanDetailsResponse>(`/challans/${id}`);
    return response.data;
  },

  createChallan: async (data: CreateChallanInput): Promise<SalesChallan> => {
    const response = await apiClient.post<SalesChallan>('/challans', data);
    return response.data;
  },

  updateChallan: async (id: string, data: CreateChallanInput): Promise<SalesChallan> => {
    const response = await apiClient.put<SalesChallan>(`/challans/${id}`, data);
    return response.data;
  },

  confirmChallan: async (id: string): Promise<SalesChallan> => {
    const response = await apiClient.post<SalesChallan>(`/challans/${id}/confirm`);
    return response.data;
  },

  cancelChallan: async (id: string): Promise<SalesChallan> => {
    const response = await apiClient.post<SalesChallan>(`/challans/${id}/cancel`);
    return response.data;
  }
};
