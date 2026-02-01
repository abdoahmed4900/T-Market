import { MatDialog } from '@angular/material/dialog';
import { afterNextRender, Component, ElementRef, inject, signal } from '@angular/core';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardNumberElement,
  StripeCardExpiryElement,
  StripeCardCvcElement,
} from '@stripe/stripe-js';
import { Router } from '@angular/router';
import { Loader } from '../../shared/loader/loader';
import { CartService } from '../../core/services/cart.service';
import { stripePublicKey } from '../../../environments/environment';

import { Observable, Subject, takeUntil } from 'rxjs';
import { Buyer } from '../auth/user';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from '../../core/services/email.service';
import { Product } from '../../core/interfaces/product';
import { Order } from '../../core/interfaces/order';
import { StripeService } from './payment.service';

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './payment.component.html',
  imports: [ReactiveFormsModule],
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  brandIcon = signal<string>('');
  stripe!: Stripe;
  private elements!: StripeElements;

  cardNumber!: StripeCardNumberElement;
  cardExpiry!: StripeCardExpiryElement;
  cardCvc!: StripeCardCvcElement;

  router = inject(Router);
  dialog = inject(MatDialog);
  cartService = inject(CartService);
  stripeService = inject(StripeService);
  price!: number;
  cardBrand: string = 'unknown';
  cartProducts! : (Product & {quantity:number})[];
  cartProductsObservable!:Observable<(Product & {quantity:number})[]>;
  private formBuilder = inject(FormBuilder);
  emailService = inject(EmailService);
  themeInterval!: any;
  destroy$ = new Subject<void>();

  paymentFormGroup = this.formBuilder.group(
     {
       name: ['',[Validators.required,Validators.minLength(3)]],
       city: ['',[Validators.required,Validators.minLength(3)]],
       street : ['',[Validators.required,Validators.minLength(3)]],
       zipCode : ['',[Validators.required,this.numericLengthValidator(5)]],
       cardNumber: [false,[Validators.requiredTrue]],
       cardExpiry: [false,[Validators.requiredTrue],],
       cardCvc: [false,[Validators.requiredTrue]],
     }
    );

    numericLengthValidator(minLength: number) {
       return (control: AbstractControl) => {
       const value = control.value?.toString() || '';
       return value.length < minLength ? { minlength: true } : null;
      };
    }

   constructor() {
    const elementRef = inject(ElementRef);
    afterNextRender(() => {
      elementRef.nativeElement.querySelector('input')?.focus();
    });
   } 

 
  async ngOnInit() {
    this.stripe = await loadStripe(stripePublicKey) as Stripe;
    this.elements = this.stripe.elements();
    this.price = this.cartService.totalCartPrice$.value;
    this.cartProductsObservable = this.cartService.getAllCartProducts().pipe(
      takeUntil(this.destroy$)
    );
    this.createStripeFields();
    this.cartProductsObservable.subscribe({
        next : (value) =>{
            this.cartProducts = value;
        },
    })
    this.watchThemeChanges();
  }
  private watchThemeChanges() {
  let lastTheme = localStorage.getItem('theme');
  this.themeInterval = setInterval(() => {
    const current = localStorage.getItem('theme');
    if (current !== lastTheme) {
      lastTheme = current;
      const style = this.baseStyle();
      if (this.cardNumber && this.cardExpiry && this.cardCvc) {
        this.cardNumber.update(style);
        this.cardExpiry.update(style);
        this.cardCvc.update(style);
      }
    }
  }, 1000);
}

baseStyle() {
  const isDark = localStorage.getItem('theme') === 'dark';
  return {
    style: {
      base: {
      color: isDark ? 'white' : 'black',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: isDark ? '#b3b3b3' : 'gray' },
      },
      invalid: {
        color: isDark ? '#fa755a' : 'red',
        iconColor: '#fa755a',
      },
    },
  };
}

  private createStripeFields() {
    this.createStripeElements();

    this.mountStripeElements();
    
    this.handleCardNumberChanges();

    this.handleCardDateChanges();

    this.handleCvcFieldChanges();
  }

  private createStripeElements() {
    this.cardNumber = this.elements.create('cardNumber', {
      ...this.baseStyle(),
      placeholder: 'Card Number'
    });
    this.cardExpiry = this.elements.create('cardExpiry', {
      ...this.baseStyle(),
      placeholder: 'Expiry Date'
    });
    this.cardCvc = this.elements.create('cardCvc', {
      ...this.baseStyle(),
      placeholder: 'CVC',
    });
  }

  private mountStripeElements() {
    this.cardNumber.mount('#card-number-element');
    this.cardExpiry.mount('#card-expiry-element');
    this.cardCvc.mount('#card-cvc-element');
  }

  private handleCardNumberChanges() {
    this.cardNumber.on('change', (event) => {
      if (event.complete) {
        this.paymentFormGroup.get('cardNumber')?.setValue(true);
        this.paymentFormGroup.get('cardNumber')?.setErrors(null);
      } else {
        this.paymentFormGroup.get('cardNumber')?.setValue(false);
        this.paymentFormGroup.get('cardNumber')?.setErrors({ invalid: true });
      }

      this.showVisaBrandIcon(event);
    });
  }

  private handleCardDateChanges() {
    this.cardExpiry.on('change', (event) => {
      if (event.complete) {
        this.paymentFormGroup.get('cardExpiry')?.setValue(true);
        this.paymentFormGroup.get('cardExpiry')?.setErrors(null);
      } else {
        this.paymentFormGroup.get('cardExpiry')?.setValue(false);
        this.paymentFormGroup.get('cardExpiry')?.setErrors({ invalid: true });
      }
    });
  }

  private handleCvcFieldChanges() {
    this.cardCvc.on('change', (event) => {
      if (event.complete) {
        this.paymentFormGroup.get('cardCvc')?.setValue(true);
        this.paymentFormGroup.get('cardCvc')?.setErrors(null);
      } else {
        this.paymentFormGroup.get('cardCvc')?.setValue(false);
        this.paymentFormGroup.get('cardCvc')?.setErrors({ invalid: true });
      }
    });
  }

  private showVisaBrandIcon(event:any) {
    switch (event.brand) {
      case 'visa':
        this.brandIcon.set('https://cdn6.aptoide.com/imgs/2/9/7/297491d84aa21e6e24c98f07b6f5411c_icon.png');
        break;
      case 'mastercard':
        this.brandIcon.set('https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg');
        break;
      case 'amex':
        this.brandIcon.set('https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/960px-American_Express_logo_%282018%29.svg.png');
        break;
      case 'discover':
        this.brandIcon.set('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbMnNAs72rFq4ucs1p9B435YbjJ_E3bShXnA&s');
        break;
      default:
        this.brandIcon.set('');
    }
  }

  async pay(name: string) {
  const ref = this.dialog.open(Loader, { disableClose: true });
  try {
    this.stripeService.setStripeAndCard(this.stripe, this.cardNumber);
    const result = await this.stripeService.createPaymentIntent(
      this.price,
      name
    );
    if (result.paymentIntent?.status !== 'succeeded') {
      throw new Error('Payment failed');
    }
    let newOrder = await this.stripeService.finishPayment(result, this.paymentFormGroup,this.price);
    const userData = await this.stripeService.updateUserOrders(newOrder);
    ref.close();
    this.router.navigate(['/'], { replaceUrl: true });
    this.sendOrderEmail(newOrder, userData);
  } catch (err) {
    console.error('❌ Payment or Firestore update failed:', err);
    ref.close();
  }
 } 
 
  private sendOrderEmail(newOrder: Order, userData: Buyer) {
    this.emailService.sendEmail(`Order ${newOrder.id}`, `
           List Of Your Order Items : \n 
           ${newOrder.items.map((e) => e.quantity + ' Items of ' + e.name + '=' + e.price + '$')}
           
           -----------------------------------------------
           Total Items : ${newOrder.totalQuantity}
           Total Price : $${newOrder.totalPrice}
    `, userData.email!);
  }

  ngOnDestroy() {
     this.cardNumber?.unmount();
     this.cardExpiry?.unmount();
     this.cardCvc?.unmount();
     clearInterval(this.themeInterval);
     this.destroy$.next();
     this.destroy$.complete();
  }
}
