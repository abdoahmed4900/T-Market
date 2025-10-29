import { Product } from "../../core/product";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  cartProducts?: (Product & { quantity: number })[],
}