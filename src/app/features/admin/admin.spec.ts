import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdminComponent } from "./admin";
import { AuthService } from "../../core/services/auth.service";
import { OrderService } from "../../shared/services/order.service";
import { of } from 'rxjs';
import { AdminService } from "./admin.service";
import { By } from "@angular/platform-browser";
import { ChartFactory } from "../../shared/services/chart.factory";

describe('AdminComponent',() => {
    let adminComponent : AdminComponent;
    let adminComponentFixture : ComponentFixture<AdminComponent>;
    let authServiceMock = {
        
    }
    let orderServiceMock = {
        getAllOrders: jasmine.createSpy().and.returnValue(of(0))
    }
    const adminServiceMock = {
      getAdmin: jasmine.createSpy().and.returnValue(
        of({
          totalProductsSold: 20,
          totalRevenue: 5000
        })
      ),
      getAllProducts: jasmine.createSpy().and.returnValue(of([])),
      getAllOrders: jasmine.createSpy().and.returnValue(of([])),
      getOrdersNumber: jasmine.createSpy().and.returnValue(of(7)),
      getNumberOfSoldProducts: jasmine.createSpy().and.returnValue(of(20)),
      getTotalRevenue: jasmine.createSpy().and.returnValue(of(5000)),
      getOrdersNumberByStatus: jasmine.createSpy().and.callFake((status: any) => of(0))
    };

    const chartFactoryMock = {
        createChart: jasmine.createSpy().and.returnValue({
          destroy: () => {},
          update: () => {},
        })
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                { provide: AdminService, useValue : adminServiceMock},
                { provide: AuthService, useValue: authServiceMock },
                { provide: OrderService, useValue: orderServiceMock },
                { provide: ChartFactory, useValue: chartFactoryMock },
            ]
        });

       
        adminComponentFixture = TestBed.createComponent(AdminComponent);
        adminComponent = adminComponentFixture.componentInstance;
    })

    it('should create component',() => {
        expect(adminComponent).toBeTruthy();
    })
    
    it('should setup dashboard data correctly',() => {
        adminComponent.setupDashBoard()
        expect(adminServiceMock.getAdmin).toHaveBeenCalled()
        expect(adminServiceMock.getOrdersNumber).toHaveBeenCalled();
        expect(adminServiceMock.getAllProducts).toHaveBeenCalled();
        expect(adminServiceMock.getNumberOfSoldProducts).toHaveBeenCalled();
        
        expect(adminComponent.cancelledOrdersNumber).toBe(0);
        expect(adminComponent.pendingOrdersNumber).toBe(0);
        expect(adminComponent.shippedOrdersNumber).toBe(0);
        expect(adminComponent.deliveredOrdersNumber).toBe(0);

        adminComponentFixture.detectChanges();

        const totalOrdersElement = adminComponentFixture.debugElement.query(By.css('.total-orders-number')).nativeElement as HTMLElement;
        expect(totalOrdersElement.textContent).toBe('7');

        const productsElements = adminComponentFixture.debugElement.queryAll(By.css('.product-item'));
        expect(productsElements.length).toBe(0);
        
        const elements = adminComponentFixture.debugElement.queryAll(By.css('.product-item'));
        expect(elements.length).toBe(0);

    })
});