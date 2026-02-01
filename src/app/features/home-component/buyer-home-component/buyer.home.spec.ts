import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProductsService } from "../../../core/services/products.service";
import { BuyerHomeComponent } from "./home";
import { of } from "rxjs";

describe('BuyerHomeComponent', () => {

  let component: BuyerHomeComponent;
  let fixture : ComponentFixture<BuyerHomeComponent>;
  let productServiceMockup = {
    getAllProducts: jasmine.createSpy().and.returnValue(of([]))
  };

  beforeEach(async() => {
    await TestBed.configureTestingModule({
        providers: [
            { provide: ProductsService, useValue: productServiceMockup }
        ]
    });
    fixture = TestBed.createComponent(BuyerHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component',  () => {
    expect(component).toBeTruthy();
  });

  it('should call getAllProducts method of ProductsService', () => {
    expect(productServiceMockup.getAllProducts).toHaveBeenCalled();
  });
});