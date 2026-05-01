export class Order{
    id!:string;
    items!: OrderItem[];
    totalPrice!:number;
    totalQuantity!:number;
    status?: 'PENDING' | 'SHIPPED' | 'CANCELLED' | 'DELIVERED'
    orderDate?: string;
    address?:string;
}

export class OrderItem{
    price!: number;
    name!: string;
    quantity!: number;
    id!: string;
}