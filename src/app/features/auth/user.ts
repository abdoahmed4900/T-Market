import { Order } from "../../core/order";
import { Product } from "../../core/product";

export interface User {
  uid: string;
  role:string;
  createdAt: Date;
  email: string | null;
  name: string | null;
  cartProducts?: (Product & { quantity: number })[],
  orders? : Order[],
}