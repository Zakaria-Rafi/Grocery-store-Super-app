export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface FilterOptions {
  searchQuery?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "all" | "user" | "admin";
  minOrders?: string;
  maxOrders?: string;
  minSpent?: string;
  maxSpent?: string;
}

export interface UpdateUserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
}
