import { CartItem } from "./cart-item";

export class Cart {
  id: number;
  totalPrice: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  coupon: string | null;

  constructor(
    id: number,
    totalPrice: string,
    status: string,
    createdAt: string,
    updatedAt: string,
    items: CartItem[],
    coupon: string | null,
  ) {
    this.id = id;
    this.totalPrice = totalPrice;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.items = items;
    this.coupon = coupon;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  static fromJson(json: any): Cart {
    return new Cart(
      json.id,
      json.totalPrice,
      json.status,
      json.createdAt,
      json.updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      json.items?.map((item: any) => CartItem.fromJson(item)) || [],
      json.coupon,
    );
  }
}

export class Product {
  id!: number;
  name!: string;
  description!: string;
  price!: string;
  stock!: number;
  barcode!: string;
  brand!: string;
  ingredients?: string;
  allergens?: string;
  nutritionalValues?: string;
  imagesUrl!: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories?: any[];

  constructor(
    id: number,
    name: string,
    description: string,
    price: string,
    stock: number,
    barcode: string,
    brand: string,
    imagesUrl: string[] = [],
    ingredients?: string,
    allergens?: string,
    nutritionalValues?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categories?: any[],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.barcode = barcode;
    this.brand = brand;
    this.imagesUrl = imagesUrl;
    this.ingredients = ingredients;
    this.allergens = allergens;
    this.nutritionalValues = nutritionalValues;
    this.categories = categories;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  static fromJson(json: any): Product {
    return new Product(
      json.id,
      json.name,
      json.description,
      json.price,
      json.stock,
      json.barcode,
      json.brand,
      Array.isArray(json.imagesUrl) ? json.imagesUrl : typeof json.imagesUrl === "string" ? [json.imagesUrl] : [],
      json.ingredients,
      json.allergens,
      json.nutritionalValues,
      json.categories,
    );
  }
}
