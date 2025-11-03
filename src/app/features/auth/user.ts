import { Product } from "../../core/product";

export interface User {
  uid: string;
  role:string;
  createdAt: Date;
  email: string | null;
  displayName: string | null;
  cartProducts?: (Product & { quantity: number })[],
}