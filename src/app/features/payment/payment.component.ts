import { MatDialog } from '@angular/material/dialog';
import { afterNextRender, Component, ElementRef, inject, Renderer2, signal } from '@angular/core';
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
import { StripeService } from './payment.service';
import { CartService } from '../../core/services/cart.service';
import { fireStoreCollections, stripePublicKey } from '../../../environments/environment';
import { addDoc, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';

import { firstValueFrom, Observable } from 'rxjs';
import { Buyer } from '../auth/user';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from '../../core/services/email.service';
import { Product } from '../../core/interfaces/product';
import { Order } from '../../core/interfaces/order';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './payment.component.html',
  imports: [ReactiveFormsModule],
  styleUrls: ['./payment.component.scss']
})
export class StripeComponent {
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
  render = inject(Renderer2);
  http = inject(HttpClient);
  price!: number;
  cardBrand: string = 'unknown';
  cartProducts! : (Product & {quantity:number})[];
  cartSub!:Observable<(Product & {quantity:number})[]>;
  private formBuilder = inject(FormBuilder);
  emailService = inject(EmailService);

  paymentFormGroup = this.formBuilder.group(
     {
       name: ['',[Validators.required,Validators.minLength(3)]],
       city: ['',[Validators.required,Validators.minLength(3)]],
       street : ['',[Validators.required,Validators.minLength(3)]],
       zipCode : ['',[Validators.required,this.numericLengthValidator(5)]],
       cardNumber: ['',[Validators.required,Validators.minLength(18)]],
       cardExpiry: ['',[Validators.required],],
       cardCvc: ['',[Validators.required,Validators.minLength(3)]],
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
    this.cartSub = this.cartService.getAllCartProducts();
    this.createStripeFields();
    this.cartSub.subscribe({
        next : (value) =>{
            this.cartProducts = value;
        },
    })
    this.watchThemeChanges();
  }
  private watchThemeChanges() {
  let lastTheme = localStorage.getItem('theme');
  setInterval(() => {
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
    // Mount them to the divs in your HTML
    this.cardNumber.mount('#card-number-element',);
    this.cardExpiry.mount('#card-expiry-element');
    this.cardCvc.mount('#card-cvc-element');
    
    this.cardNumber.on('change', (event) => {
      if (event.complete) {
          this.paymentFormGroup.get('cardNumber')?.setValue('complete');
          this.paymentFormGroup.get('cardNumber')?.setErrors(null);
      } else {
          this.paymentFormGroup.get('cardNumber')?.setValue('');
          this.paymentFormGroup.get('cardNumber')?.setErrors({ invalid: true });
      }

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
    });


    this.cardExpiry.on('change', (event) => {
      if (event.complete) {
          this.paymentFormGroup.get('cardExpiry')?.setValue('complete');
          this.paymentFormGroup.get('cardExpiry')?.setErrors(null);
      } else {
          this.paymentFormGroup.get('cardExpiry')?.setValue('');
          this.paymentFormGroup.get('cardExpiry')?.setErrors({ invalid: true });
      }
    });

    this.cardCvc.on('change', (event) => {
      if (event.complete) {
          this.paymentFormGroup.get('cardCvc')?.setValue('complete');
          this.paymentFormGroup.get('cardCvc')?.setErrors(null);
      } else {
          this.paymentFormGroup.get('cardCvc')?.setValue('');
          this.paymentFormGroup.get('cardCvc')?.setErrors({ invalid: true });
      }
    });
  }

  async pay(name: string) {
  const ref = this.dialog.open(Loader, { disableClose: true });

  try {
    const result = await this.stripeService.makePaymentWithCard(
      this.price,
      this.cardNumber,
      this.stripe,
      name
    );

    if (result.paymentIntent?.status !== 'succeeded') {
      throw new Error('Payment failed');
    }

    // Payment succeeded
    const uid = localStorage.getItem('token');
    const userRef = doc(this.cartService.fireStore, fireStoreCollections.users, uid!);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() as Buyer;

    // Prepare new order
    const newOrder: Order = {
      id: result.paymentIntent!.id,
      totalPrice: this.price,
      address: `${this.paymentFormGroup.get('zipCode')?.value},${this.paymentFormGroup.get('street')?.value},${this.paymentFormGroup.get('city')?.value}`,
      status : 'Pending',
      orderDate : new Date().toDateString(),
      totalQuantity: this.cartService.totalCartProductsNumber$.value,
      items: userData.cartProducts?.map(p => ({
        name: p.name,
        price: p.price,
        id: p.id,
        quantity: p.quantity,
      })) ?? [],
    };

    // Update Firestore
    const updatedOrders = [...(userData.orders ?? []), newOrder];
    await updateDoc(userRef, { orders: updatedOrders, cartProducts: [] });

    // Reset local cart state
    this.cartService.totalCartPrice$.next(0);
    this.cartService.totalCartProductsNumber$.next(0);

    ref.close();
    this.router.navigate(['/'], { replaceUrl: true });
    console.log('✅ Payment success, order saved:', newOrder);
    await firstValueFrom(await this.http.post('http://localhost:4242/api/send-notification',{
      message: 'Your order has been placed successfully!',
      userId: uid,
    }))
    let orders = collection(this.cartService.fireStore,fireStoreCollections.orders)
    await addDoc(orders,{...newOrder,userId: uid})
    this.emailService.sendEmail(`Order ${newOrder.id}`,`
           List Of Your Order Items : \n 
           ${newOrder.items.map((e) => e.quantity + ' Items of ' + e.name + '=' + e.price + '$')}
           
           -----------------------------------------------
           Total Items : ${newOrder.totalQuantity}
           Total Price : $${newOrder.totalPrice}
    `,userData.email!);

  } catch (err) {
    console.error('❌ Payment or Firestore update failed:', err);
    ref.close();
  }
 } 
}
