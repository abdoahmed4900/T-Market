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
  cartProducts?:  {quantity: number , id: string, name:string, price:number}[];
  ordersIds : string[];
  wishListIds : string[];
}
export interface Admin extends User{
    totalRevenue:number;
    totalOrders?:number;
    totalProductsSold:number;
}
