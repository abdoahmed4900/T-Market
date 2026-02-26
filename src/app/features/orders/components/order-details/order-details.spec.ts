import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OrderDetails } from "./order-details";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { OrderService } from "../../../shared/services/order.service";
import { of } from "rxjs";
import { ProductsService } from "../../../shared/services/products.service";
import { OrderItemCard } from "../order-item-card/order-item-card";

describe('OrderDetailsComponent', () => {
    let component : OrderDetails;
    let fixture: ComponentFixture<OrderDetails>;
    const activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({ id: '123' })
      }
    };
    let orderServiceMock = {
        getOrderById: jasmine.createSpy().and.returnValue(of({  
            id:'123',
            items: [
                {price: 15, name: 'Item A', quantity: 1 , id: '1'},
                {price: 25, name: 'Item B', quantity: 3 , id: '2'}
            ],
            totalPrice: 90,
            totalQuantity: 4,
            status: 'Shipped',
            orderDate: '2023-02-01',
            address:'456 Elm St',
            sellerId:'seller456',
        })),
    };
    let productsServiceMock = {
        getProductById: jasmine.createSpy().and.returnValue(of({
            id: '1',
            name: 'Item A',
            price: 15,
            imageUrls: ['https://example.com/imageA.jpg'],
            
        }))
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                { provide: OrderService, useValue: orderServiceMock },
                { provide: ProductsService, useValue: productsServiceMock },    
                { provide: ActivatedRoute, useValue: activatedRouteMock },
            ],
            imports: [
                OrderItemCard
            ]
        })
        fixture = TestBed.createComponent(OrderDetails);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });
});