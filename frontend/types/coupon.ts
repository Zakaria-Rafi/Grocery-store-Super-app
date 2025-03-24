import type { Product } from "./product";
import type { User } from "./user";

export interface Coupon {
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  isGlobal: boolean;
  usageLimit: number;
  expiryDate: Date;
  products: Product[];
  users: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  searchQuery?: string;
  code?: string;
  discountType?: "ALL" | "PERCENTAGE" | "FIXED";
  isGlobal?: boolean;
  usageLimit?: number;
  expiryDate?: string;
  products?: string[];
  users?: string[];
}

export interface UpdateCouponDto {
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  isGlobal: boolean;
  usageLimit: number;
  expiryDate: Date;
  productIds: number[];
  userIds: number[];
}
