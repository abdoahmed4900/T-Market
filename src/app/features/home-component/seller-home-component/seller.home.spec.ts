import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { SellerHomeComponent } from "./seller-home-component";
import { HomeService } from "../home.service";
import { ProductsService } from "../../../core/services/products.service";

describe('BuyerHomeComponent', () => {

  let component: SellerHomeComponent;
  let fixture : ComponentFixture<SellerHomeComponent>;
  let homeServiceMockup = {
    getUser: jasmine.createSpy().and.returnValue(of({}))
  };
  let productsServiceMockup = {
    getAllProducts: jasmine.createSpy().and.returnValue(of([]))
  };

  beforeEach(async() => {
    await TestBed.configureTestingModule({
        providers: [
            { provide: HomeService, useValue: homeServiceMockup },
            { provide: ProductsService, useValue: productsServiceMockup },
        ]
    });
    fixture = TestBed.createComponent(SellerHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component',  () => {
    expect(component).toBeTruthy();
  });

  it('should call getUser method of HomeService', () => {
    expect(homeServiceMockup.getUser).toHaveBeenCalled();
  });
  
  it('should call getAllProducts method of ProductsService', () => {
    expect(productsServiceMockup.getAllProducts).toHaveBeenCalled();
  });
});