import { Review } from "./review";

export interface Product {
    id?: string;
    name : string;
    price : number;
    description : string;
    imageUrls? : string[];
    category : string;
    stock: number;
    soldItemsNumber? : number;
    brand: string;
    rating: number;
    sellerId?: string;
    reviews: Review[];
}
