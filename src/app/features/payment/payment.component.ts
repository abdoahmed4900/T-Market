import { MatDialog } from '@angular/material/dialog';
import { Component, inject, signal } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';
import { Router } from '@angular/router';
import { Loader } from '../../shared/loader/loader';
import { StripeService } from './payment.service';
import { CartService } from '../../core/cart.service';
import { stripePublicKey } from '../../../environments/environment';

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './payment.component.html',
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
  price!: number;
  cardBrand: string = 'unknown';
 
  async ngOnInit() {
    this.stripe = await loadStripe(stripePublicKey) as Stripe;
    this.elements = this.stripe.elements();
    this.price = this.cartService.totalCartPrice$.value;

    this.createStripeFields();

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
  }, 300);
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
    this.cardNumber.mount('#card-number-element');
    this.cardExpiry.mount('#card-expiry-element');
    this.cardCvc.mount('#card-cvc-element');
    this.cardNumber.on('change', (event) => {
      this.cardBrand = event.brand;
      console.log(event.brand);

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
  }

  async pay(name: string) {
    const ref = this.dialog.open(Loader, { disableClose: true });

    const result = await this.stripeService.makePaymentWithCard(
      this.price,
      this.cardNumber,
      this.stripe,
      name
    );

    if (result.paymentIntent?.status === 'succeeded') {
      console.log('Payment succeeded!');
      
      // this.stripeService.confirmBookingPayment(this.bookingId, this.price).subscribe({
      //   next: () => {
      //     ref.close();
      //     // this.toastService.success('Payment successful!', '✅ Success', {
      //     //   toastClass: 'ngx-toastr custom-success'
      //     // });
      //     this.router.navigate(['/'], { replaceUrl: true });
      //   },
      //   error: () => {
      //     ref.close();
      //     // this.toastService.error('❌ Payment failed! Try Again Later', '❌ Error', {
      //     //   toastClass: 'ngx-toastr custom-error'
      //     // });
      //   },
      // });
    } else {
      ref.close();
      // this.toastService.error('❌ Payment failed! Try Again Later', '❌ Error', {
      //   toastClass: 'ngx-toastr custom-error'
      // });
    }
  }
}
