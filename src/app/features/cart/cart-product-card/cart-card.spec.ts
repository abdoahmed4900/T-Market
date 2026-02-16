import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CartService } from "../../../shared/services/cart.service";
import { BehaviorSubject, of } from "rxjs";
import { CartCard } from "./cart-card";
import { ProductsService } from "../../../shared/services/products.service";
import { provideRouter } from "@angular/router";

describe('CartCardComponent',() => {
    let component : CartCard;
    let componentFixture : ComponentFixture<CartCard>;
    let price$ = new BehaviorSubject<number>(0);
    let cartServiceMockUp = {
            getAllCartProducts: jasmine.createSpy().and.returnValue(of([])),
            totalCartPrice$: price$,
            updateProductNumberInCart: jasmine.createSpy().and.callFake((id:string,newQuantity:number,price:number) => {
                return of(true);
            }),
            removeProductFromCart: jasmine.createSpy().and.callFake((id:string) => {
                return of(true);
            }),
    }
    let productServiceMockUp = {
            getProductById: jasmine.createSpy().and.callFake((id:string,price:number) => of({
               id: '2',
               name: 'Test Product',
               price: 100,
               quantity: 0,
               imageUrls: [],
            })),
    }
    
    beforeEach(async () => {
        await TestBed.configureTestingModule(
            {
                providers: [
                    { provide: CartService , useValue: cartServiceMockUp },
                    { provide: ProductsService , useValue: productServiceMockUp },
                    provideRouter([]),
                ]
            }
        )
        .compileComponents();
        componentFixture = TestBed.createComponent(CartCard);

        componentFixture.componentRef.setInput('productId', '1');
        componentFixture.componentRef.setInput('quantity', 0);
        componentFixture.componentRef.setInput('cartProduct', {
           id: '2',
           name: 'Test Product',
           price: 100,
           quantity: 0,
           imageUrls: [],
        });
        component = componentFixture.componentInstance;
        componentFixture.detectChanges();
    })

    it('should create component',() => {

        expect(component).toBeTruthy()
    })

    it('should call get product by id',() => {
        componentFixture.detectChanges();
        expect(productServiceMockUp.getProductById).toHaveBeenCalled();
        expect(productServiceMockUp.getProductById).toHaveBeenCalledWith('1');
    })

    it('should call call remove from cart',() => {
        component.removeFromCart();
        expect(cartServiceMockUp.removeProductFromCart).toHaveBeenCalled();
        expect(cartServiceMockUp.removeProductFromCart).toHaveBeenCalledWith('1',100);
    })

    it('should call increase quantity',() => {
        // let element = componentFixture.nativeElement.querySelector('.quantity-number') as HTMLElement;
        // expect(element.innerText).toBe('0');
        component.increaseQuantity();
        expect(cartServiceMockUp.updateProductNumberInCart).toHaveBeenCalled();
        expect(cartServiceMockUp.updateProductNumberInCart).toHaveBeenCalledWith('1',1,100);
    })
    it('should call decrease quantity',() => {
        component.decreaseQuantity();
        expect(cartServiceMockUp.updateProductNumberInCart).toHaveBeenCalled();
        expect(cartServiceMockUp.updateProductNumberInCart).toHaveBeenCalledWith('1',-1,100);
    })
})