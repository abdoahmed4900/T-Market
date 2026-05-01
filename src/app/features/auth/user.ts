import { CartProduct } from "../cart/cart.product";

export interface User {
  uid: string;
  role: string;
  createdAt: string;
  email: string | null;
  name: string | null;
}

export interface Seller extends User {
  productsIds?: string[];
  soldItemsNumber?: number;
  totalRevenue?: number;
}
export interface Buyer extends User {
  cartProducts?: CartProduct[];
  ordersIds: string[];
  wishListIds: string[];
}
export interface Admin extends User {
  totalRevenue: number;
  totalOrders?: number;
  totalProductsSold: number;
}
