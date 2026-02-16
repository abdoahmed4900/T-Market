import { of } from "rxjs";
import { OrderService } from "../../../shared/services/order.service";
import { OrderItem } from "./order-item";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

describe('OrderItemComponent',() => {
    let component: OrderItem;
    let fixture: ComponentFixture<OrderItem>;
    let orderServiceMock = {
        changeStatusOrder: jasmine.createSpy().and.returnValue(of({})),
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                { provide: OrderService, useValue: orderServiceMock },
                provideRouter([]),
            ],
        })
        .compileComponents()
        fixture = TestBed.createComponent(OrderItem);
        component = fixture.componentInstance;
        component.role.set('admin');
        fixture.componentRef.setInput('order', {  
            id:'123',
            items: [
                {price: 10, name: 'Item 1', quantity: 2},
                {price: 20, name: 'Item 2', quantity: 1}
            ],
            totalPrice: 40,
            totalQuantity: 3,
            status: 'Pending',
            orderDate: '2023-01-01',
            address:'123 Main St',
            sellerId:'seller123'
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call changeStatusOrder when status is updated', () => {
      component.changeOrderStatus('Cancelled');
      expect(orderServiceMock.changeStatusOrder).toHaveBeenCalled();
      expect(orderServiceMock.changeStatusOrder).toHaveBeenCalledWith('123', 'Cancelled');
      
    });
});