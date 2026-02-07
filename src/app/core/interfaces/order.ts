export class Order{
    id!:string;
    items!: {price:number,name:string,quantity:number,id?:string}[];
    totalPrice!:number;
    totalQuantity!:number;
    status?: 'PENDING' | 'SHIPPED' | 'CANCELLED' | 'DELIVERED'
    orderDate?: string;
    address?:string;
    sellerId?:string;
}