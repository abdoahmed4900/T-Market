import { Review } from "./review";

export interface Product {
    id?: string;
    name : string;
    price : number;
    description : string;
    imageUrls : string[];
    category : string;
    stock: number;
    brand: string;
    rating: number;
    reviews: Review[];
}
