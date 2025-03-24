export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  barcode: string;
  catalogStatus: "Actif" | "Inactif";
  imagesUrl: string[];
  totalRevenue: number;
  userSetStatus: "Actif" | "Inactif";
  taxRate: number;
  ingredients: string;
  allergens: string;
  nutritionalValues: string;
  ean: string;
}

export interface ProductFilters {
  name: string;
  brand: string;
  stockStatus: "all" | "in_stock" | "out_of_stock";
  catalogStatus: "all" | "active" | "inactive";
  minPrice: string;
  maxPrice: string;
  minStock: string;
  maxStock: string;
}

export interface ProductEanSubmit {
  eanCode: string;
}
