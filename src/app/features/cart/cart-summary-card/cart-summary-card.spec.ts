import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CartService } from "../../../shared/services/cart.service";
import { BehaviorSubject, of } from "rxjs";
import { CartSummaryCard } from "./cart-summary-card";

describe('CartSummaryCardComponent',() => {
    let component : CartSummaryCard;
    let componentFixture : ComponentFixture<CartSummaryCard>;
    let price$ = new BehaviorSubject<number>(0);
    let cartServiceMockUp = {
            getAllCartProducts: jasmine.createSpy().and.returnValue(of([])),
            totalCartPrice$: price$,
    }
    
    beforeEach(async () => {
        await TestBed.configureTestingModule(
            {
                providers: [
                    { provide: CartService , useValue: cartServiceMockUp }
                ]
            }
        )
        .compileComponents();
        componentFixture = TestBed.createComponent(CartSummaryCard);
        component = componentFixture.componentInstance;
        componentFixture.detectChanges();
    })

    it('should create component',() => {
        componentFixture = TestBed.createComponent(CartSummaryCard);
        component = componentFixture.componentInstance;
        componentFixture.detectChanges();
        expect(component).toBeTruthy()
    })
})