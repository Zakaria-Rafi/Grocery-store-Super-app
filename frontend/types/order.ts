import type { Product } from "./product";
import type { User } from "./user";

export interface Order {
  id: string;
  orderNumber: string;
  created_at: string;
  status: string;
  amount: number;
  user: User;
  products: OrderProduct[];
}

export interface OrderProduct {
  productId: number;
  quantity: number;
  product: Product | null;
  search: string;
  showList: boolean;
}

export interface OrderFilters {
  orderNumber: string;
  buyer: string;
  dateRange: {
    from: string;
    to: string;
  };
  amount: { min: string; max: string };
  status: string;
  productsCount: { min: string; max: string };
}

export interface OrderFiltersForm {
  orderNumber: string;
  buyer: string | number;
  dateRange: {
    from: string | undefined;
    to: string | undefined;
  };
  amount: { min: string; max: string };
  status: string;
  productsCount: { min: string; max: string };
}
