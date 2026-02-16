import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Orders } from "./orders";
import { OrderService } from "../../shared/services/order.service";
import { of } from "rxjs";
import { provideRouter } from "@angular/router";

describe('OrdersComponent',() => {
    let component: Orders;
    let fixture: ComponentFixture<Orders>;
    let orderServiceMock = {
        getMyOrders: jasmine.createSpy().and.returnValue(of([
            { id: '1', status: 'Shipped', orderDate: '2024-07-10' , items: [], totalPrice: 100, totalQuantity: 2, address: '123 Street', sellerId: '2' },
            { id: '2', status: 'Delivered', orderDate: '2024-07-12', items: [], totalPrice: 100, totalQuantity: 3 , address: '345 Street', sellerId: '3' },
            { id: '3', status: 'Cancelled', orderDate: '2024-07-14', items: [], totalPrice: 100, totalQuantity: 5  , address: '345 Street', sellerId: '3' },
        ]))
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers : [
                { provide: OrderService, useValue: orderServiceMock },
                provideRouter([])
            ]
        })
        .compileComponents();
        fixture = TestBed.createComponent(Orders);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should change status to delivered and filter orders based on it', () => {
        component.setStatus('Delivered');
        expect(component.selectedStatus()).toBe('Delivered');
        component.orders.subscribe({
            next: (orders) => {
                expect(orders.length).toBe(1);
                expect(orders[0].status).toBe('Delivered');
                expect(orders[0]).toEqual({ id: '2', status: 'Delivered', orderDate: '2024-07-12', items: [], totalPrice: 100, totalQuantity: 3 , address: '345 Street', sellerId: '3' });
            }
        });
        
    });
    
    it('should change start date', () => {
        component.setStartDate('2024-06-01');
        expect(component.startDate()).toBe('2024-06-01');
    });
    it('should change end date', () => {
        component.setEndDate('2024-07-14');
        expect(component.endDate()).toBe('2024-07-14');
        component.orders.subscribe({
            next: (orders) => {
                expect(orders.length).toBe(3);
            }
        }); 
    });
    it('should apply these filters', () => {
        component.setEndDate('2024-07-15');
        component.setStartDate('2024-07-01');
        component.setStatus('Shipped');
        expect(component.selectedStatus()).toBe('Shipped');
        expect(component.startDate()).toBe('2024-07-01');
        expect(component.endDate()).toBe('2024-07-15');
    });
})