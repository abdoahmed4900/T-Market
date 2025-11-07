export class Order{
    id!:string;
    items!: {price:number,name:string,quantity:number}[];
    totalPrice!:number;
    totalQuantity!:number;
}