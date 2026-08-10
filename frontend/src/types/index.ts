export type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type CustomerType = 'retail' | 'wholesale' | 'distributor';
export type CustomerStatus = 'lead' | 'active' | 'inactive';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  business_name: string | null;
  gst_number: string | null;
  customer_type: CustomerType;
  address: string | null;
  status: CustomerStatus;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  created_by: string | null;
  created_by_name?: string;
  created_by_role?: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  unit_price: number | string; // Numeric values from postgres are often returned as string in JSON
  current_stock: number;
  min_stock_alert: number;
  location: string | null;
  is_low_stock?: boolean;
  created_at: string;
  updated_at: string;
}

export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  product_id: string;
  quantity_changed: number;
  movement_type: MovementType;
  reason: string;
  reference_type: string | null;
  reference_id: string | null;
  created_by: string | null;
  created_by_name?: string;
  created_by_role?: UserRole;
  created_at: string;
}

export type ChallanStatus = 'draft' | 'confirmed' | 'cancelled';

export interface SalesChallan {
  id: string;
  challan_number: string;
  customer_id: string;
  status: ChallanStatus;
  total_quantity: number;
  created_by: string;
  created_by_name?: string;
  customer_name?: string;
  customer_business_name?: string;
  created_at: string;
  confirmed_at: string | null;
}

export interface ChallanItem {
  id: string;
  challan_id: string;
  product_id: string;
  product_name_snapshot: string;
  product_sku_snapshot: string;
  unit_price_snapshot: number | string;
  quantity: number;
  location?: string | null;
}
