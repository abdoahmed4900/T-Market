import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OrderItemCard } from "./order-item-card";
import { ProductsService } from "../../../core/services/products.service";
import { provideRouter } from "@angular/router";
import { of } from "rxjs";

describe('OrderItemCardComponent', () => {
    let component: OrderItemCard;
    let fixture : ComponentFixture<OrderItemCard>;
    let productsServiceMock = {
        getProductById: jasmine.createSpy().and.callFake((id: string) => {
            return of({
                category : 'string',
                soldItemsNumber : 0,
                brand: 'string',
                rating: 4.5,
                sellerId: '2',
                reviews: [],
                id: id,
                name: 'Test Product',
                price: 50,
                description: 'A product for testing',
                imageUrls: ['http://example.com/image.jpg'],
                stock: 10
            });
        })
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [                 
                { provide: ProductsService, useValue: productsServiceMock },
                provideRouter([]),
            ]
        })
        .compileComponents();
        fixture = TestBed.createComponent(OrderItemCard);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('orderItem', {price:50,name:'Test Product',quantity:2,id:'123'});
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch product on init', () => {
        fixture.detectChanges();
        expect(productsServiceMock.getProductById).toHaveBeenCalled();
    });
    it('should fetch product with correct id', () => {
        fixture.detectChanges();
        expect(productsServiceMock.getProductById).toHaveBeenCalledWith('123');
    });
});