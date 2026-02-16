import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CartComponent } from "./cart";
import { CartService } from "../../shared/services/cart.service";
import { BehaviorSubject, of } from "rxjs";
import { provideRouter } from "@angular/router";

describe('CartComponent',() => {
     
    let component : CartComponent;
    let componentFixture : ComponentFixture<CartComponent>;
    let price$ = new BehaviorSubject<number>(0);
    let cartServiceMockUp = {
        getAllCartProducts: jasmine.createSpy().and.returnValue(of([])),
        totalCartPrice$: price$,
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule(
            {
                providers: [
                    { provide: CartService, useValue: cartServiceMockUp},
                    provideRouter([]),
                ]
            }
        ).compileComponents()
        componentFixture = TestBed.createComponent(CartComponent);
        component = componentFixture.componentInstance;
        componentFixture.detectChanges();
    })

    it('should create component',() => {
        expect(component).toBeTruthy()
    })

    it('should get cart products',() => {
        expect(cartServiceMockUp.getAllCartProducts).toHaveBeenCalled()
        component.products.subscribe(data => {
          expect(data).toEqual([]);
        });
    })
    
    it('should get cart products price',async () => {
        const value = component.totalPrice;

        value.subscribe(price => {
            expect(price).toBe(0);
        })

    });

    
})