import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WishlistService } from "./wishlist.service";
import { Wishlist } from "./wishlist";
import { of } from "rxjs";
describe('WishlistComponent', () => {
    let component : Wishlist;
    let fixture: ComponentFixture<Wishlist>;
    let wishlistServiceMock = {
        getWishList: jasmine.createSpy().and.returnValue(of([
            { 
                id: '1', 
                name: 'Product 1',
                imageUrls: ['url1'], 
                price: 100 , 
                description: 'desc1', 
                category: 'cat1', 
                stock: 10, 
                rating: 4.5 , 
                reviews: [],
                sellerId: 'seller123',
                brand: 'brand1',
                soldItemsNumber: 50
            },
        ])),
        removeFromWishList: jasmine.createSpy().and.returnValue(Promise.resolve(true))
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                { provide: WishlistService, useValue: wishlistServiceMock },
            ],
        })
        fixture = TestBed.createComponent(Wishlist);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should load wishlist on init', () => {
        expect(wishlistServiceMock.getWishList).toHaveBeenCalled();
        expect(component.wishList().length).toBe(1);
    });
    it('should remove item from wishlist and empty list', async () => {
        expect(component.wishList()).toEqual([
            { 
                id: '1', 
                name: 'Product 1',
                imageUrls: ['url1'], 
                price: 100 , 
                description: 'desc1', 
                category: 'cat1', 
                stock: 10, 
                rating: 4.5 , 
                reviews: [],
                sellerId: 'seller123',
                brand: 'brand1',
                soldItemsNumber: 50
            }
        ])
        await component.removeFromWishList('1');
        expect(wishlistServiceMock.removeFromWishList).toHaveBeenCalledWith('1');
        expect(component.wishList()).toEqual([]);   
    });
});