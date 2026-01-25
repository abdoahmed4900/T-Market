import { Product } from "../../core/interfaces/product";

export interface User {
  uid: string;
  role:string;
  createdAt: Date;
  email: string | null;
  name: string | null;
}

export interface Seller extends User{
  productsIds?: string[];
  totalProductsSold?:number;
  totalRevenue?:number;
}
export interface Buyer extends User{
  cartProducts?: (Product & { quantity: number })[];
  ordersIds : string[];
}
export interface Admin extends User{
    totalRevenue:number;
    totalOrders?:number;
    totalProductsSold:number;
}
