import { CartService } from "../../shared/services/cart.service";
import { PaymentComponent } from "./payment.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { StripeService } from "./services/payment.service";
import { EmailService } from "./services/email.service";

describe('PaymentComponent',() => {
    let component: PaymentComponent;
    let fixture: ComponentFixture<PaymentComponent>;
    let cartServiceMock = {
        getAllCartProducts: jasmine.createSpy('getAllCartProducts').and.returnValue([]),
        totalCartPrice$: jasmine.createSpy('totalCartPrice$').and.returnValue(0)
    }
    let stripeServiceMock = {
        createPaymentIntent: jasmine.createSpy('createPaymentIntent').and.callFake((price:number, cardNumberElement: any, stripe: any, name: string) => {
            return Promise.resolve(
                {
                  clientSecret: 'test_client_secret',
                  paymentIntent: {status: 'succeeded'}
                }
            )
        }),
        setStripeAndCard: jasmine.createSpy('setStripeAndCard').and.returnValue(true),
        finishPayment: jasmine.createSpy('finishPayment').and.returnValue(Promise.resolve({ id: 'order_123', totalPrice: 2000, totalQuantity: 2, status: 'Completed', amount: 1000, orderDate: Date.now(), address: '123 Test St, Test City, 12345', items: [], sellerId: '1' })),
        updateUserOrders: jasmine.createSpy('updateUserOrders').and.returnValue(Promise.resolve(true)),
    }
    let emailServiceMock = {
        sendEmail: jasmine.createSpy('sendEmail').and.returnValue(Promise.resolve(true))
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                { provide: CartService, useValue: cartServiceMock },
                { provide: StripeService, useValue: stripeServiceMock },
                { provide: EmailService, useValue: emailServiceMock },
            ],
        })

        fixture = TestBed.createComponent(PaymentComponent);
        component = fixture.componentInstance;
        component.price = 1000;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize payment form group on ngOnInit', () => {
        expect(component.paymentFormGroup).toBeDefined();
        expect(component.paymentFormGroup.get('name')).toBeDefined();
        expect(component.paymentFormGroup.get('city')).toBeDefined();
        expect(component.paymentFormGroup.get('street')).toBeDefined();
        expect(component.paymentFormGroup.get('zipCode')).toBeDefined();
        expect(component.paymentFormGroup.get('cardNumber')).toBeDefined();
        expect(component.paymentFormGroup.get('cardExpiry')).toBeDefined();
        expect(component.paymentFormGroup.get('cardCvc')).toBeDefined();
    });

    it('should validate name field correctly', () => {
        const nameControl = component.paymentFormGroup.get('name');
        nameControl?.setValue('');
        expect(nameControl?.valid).toBeFalse();
        nameControl?.setValue('Jo');
        expect(nameControl?.valid).toBeFalse();
        nameControl?.setValue('John Doe');
        expect(nameControl?.valid).toBeTrue();
    });

    it('should validate zip code field correctly', () => {
        const zipCodeControl = component.paymentFormGroup.get('zipCode');
        zipCodeControl?.setValue('');
        expect(zipCodeControl?.valid).toBeFalse();
        zipCodeControl?.setValue('123');
        expect(zipCodeControl?.valid).toBeFalse();
        zipCodeControl?.setValue('12345');
        expect(zipCodeControl?.valid).toBeTrue();
    });
    
    it('should validate card number field correctly', () => {
        const cardNumberControl = component.paymentFormGroup.get('cardNumber');
        cardNumberControl?.setValue(false);
        expect(cardNumberControl?.valid).toBeFalse();
        cardNumberControl?.setValue(true);
        expect(cardNumberControl?.valid).toBeTrue();
    });

    it('should call createPaymentIntent, finish payment, and send email when pay is called', async () => {
        component.paymentFormGroup.get('name')?.setValue('Test User');
        component.paymentFormGroup.get('city')?.setValue('Test City');
        component.paymentFormGroup.get('street')?.setValue('123 Test St');
        component.paymentFormGroup.get('zipCode')?.setValue('12345');
        component.paymentFormGroup.get('cardNumber')?.setValue(true);
        component.paymentFormGroup.get('cardExpiry')?.setValue(true);
        component.paymentFormGroup.get('cardCvc')?.setValue(true);
        await component.pay('Test User');
        expect(stripeServiceMock.createPaymentIntent).toHaveBeenCalledWith(1000,'Test User');
        expect(stripeServiceMock.finishPayment).toHaveBeenCalled();
        expect(emailServiceMock.sendEmail).toHaveBeenCalled();
    });
})