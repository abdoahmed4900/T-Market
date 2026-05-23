import { MatDialog } from '@angular/material/dialog';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardNumberElement,
  StripeCardExpiryElement,
  StripeCardCvcElement,
} from '@stripe/stripe-js';
import { Router } from '@angular/router';
import { Loader } from '../../shared/components/loader/loader';
import { CartService } from '../../shared/services/cart.service';
import { stripePublicKey } from '../../../environments/environment';

import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from './services/email.service';
import { StripeService } from './services/payment.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProgressService } from '../../shared/components/payment-progress-bar/progress.service';
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { numericLengthValidator } from '../../shared/methods';
import { ToastService } from '../../shared/services/toast.service';
import { CartProduct } from '../cart/cart.product';

import {
  faCreditCard,
  faUser,
  faLocationDot,
  faEnvelope,
  faBuilding,
  faCalendarAlt,
  faLock,
  faShieldAlt,
  faArrowRight,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './payment.component.html',
  imports: [ReactiveFormsModule, TranslateModule, Loader, AnimateOnScroll, FaIconComponent],
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  brandIcon = signal<string>('');
  stripe!: Stripe;
  private elements!: StripeElements;
  translateService = inject(TranslateService);

  // In your component
  paymentIcon = faCreditCard;
  userIcon = faUser;
  locationIcon = faLocationDot;
  zipIcon = faEnvelope;
  cityIcon = faBuilding;
  cardIcon = faCreditCard;
  calendarIcon = faCalendarAlt;
  lockIcon = faLock;
  shieldIcon = faShieldAlt;
  warningIcon = faExclamationTriangle;
  arrowIcon = faArrowRight;

  cardNumber!: StripeCardNumberElement;
  cardExpiry!: StripeCardExpiryElement;
  cardCvc!: StripeCardCvcElement;

  router = inject(Router);
  dialog = inject(MatDialog);
  cartService = inject(CartService);
  stripeService = inject(StripeService);
  price = computed(() => {
    return this.cartService.totalCartPrice$.value;
  });
  cardBrand: string = 'unknown';
  cartProducts!: CartProduct[];
  private formBuilder = inject(FormBuilder);
  emailService = inject(EmailService);
  themeInterval!: any;
  destroy$ = new Subject<void>();
  isCardNumberValid = signal(false);
  isCardDateValid = signal(false);
  isCardCvcValid = signal(false);
  isCardNumberTouched = signal(false);
  isCardDateTouched = signal(false);
  isCardCvcTouched = signal(false);
  isFormValid = computed(() => {
    return this.isCardCvcValid() && this.isCardDateValid() && this.isCardNumberValid() && this.cartService.totalCartPrice$.value > 0;
  });

  isLangEnglish = linkedSignal(() => {
    return (this.translateService.currentLang ?? 'en') == 'en';
  })

  paymentFormGroup = this.formBuilder.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required, Validators.minLength(3)]],
      street: ['', [Validators.required, Validators.minLength(3)]],
      zipCode: ['', [Validators.required, numericLengthValidator(5)]],
    }
  );
  isStripeCreated = signal(false);
  progressService = inject(ProgressService);
  toastService = inject(ToastService);

  constructor() {
    const elementRef = inject(ElementRef);
    afterNextRender(() => {
      elementRef.nativeElement.querySelector('input')?.focus();
    });
  }


  async ngOnInit() {
    await this.createStripeInstance();
    this.cartService.getAllCartProducts().pipe(
      takeUntil(this.destroy$)).subscribe({
        next: (value) => {
          this.cartProducts = value;
        },
      })
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          this.isLangEnglish.set(value.lang == 'en' ? true : false)
        },
      }
    )
    this.watchThemeChanges();
  }
  private async createStripeInstance() {
    (loadStripe(stripePublicKey)).then((val) => {
      this.stripe = val!;
      this.elements = this.stripe.elements();
      this.createStripeFields();
    });
  }

  private watchThemeChanges() {
    let lastTheme = localStorage.getItem('theme') ?? 'light';
    this.themeInterval = setInterval(() => {
      const current = localStorage.getItem('theme') ?? 'light';
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
          color: 'black',
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
      placeholder: this.translateService.instant('PAYMENT.CARD_NUMBER')
    });
    this.cardExpiry = this.elements.create('cardExpiry', {
      ...this.baseStyle(),
      placeholder: this.translateService.instant('PAYMENT.CARD_EXPIRY_DATE')
    });
    this.cardCvc = this.elements.create('cardCvc', {
      ...this.baseStyle(),
      placeholder: this.translateService.instant('PAYMENT.CARD_CVC'),
    });
    this.isStripeCreated.set(true);
  }

  private mountStripeElements() {
    setTimeout(() => {
      this.cardNumber.mount('#card-number-element');
      this.cardExpiry.mount('#card-expiry-element');
      this.cardCvc.mount('#card-cvc-element');
    }, 100)
  }

  private handleCardNumberChanges() {
    this.cardNumber.on('change', (event) => {
      this.isCardNumberValid.set(event.complete);
      this.showVisaBrandIcon(event);

    })

    this.cardNumber.on('blur', () => {
      this.isCardNumberTouched.set(true);
    })
  }

  private handleCardDateChanges() {
    this.cardExpiry.on('change', (event) => {
      this.isCardDateValid.set(event.complete);
    });

    this.cardExpiry.on('blur', () => {
      this.isCardDateTouched.set(true);
    })
  }

  private handleCvcFieldChanges() {
    this.cardCvc.on('change', (event) => {
      this.isCardCvcValid.set(event.complete);
    });

    this.cardCvc.on('blur', () => {
      this.isCardCvcTouched.set(true);
    })
  }

  private showVisaBrandIcon(event: any) {
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
        this.price(),
        name
      );
      if (result.paymentIntent?.status !== 'succeeded') {
        throw new Error('Payment failed');
      }
      await this.stripeService.finishPayment(result, this.paymentFormGroup, this.price());
      this.progressService.goToFinalStep();
      ref.close();
      this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.ORDER_PLACED'));
      this.router.navigate(['/'], { replaceUrl: true });
    } catch (err) {
      console.error('❌ Payment or Firestore update failed:', err);
      ref.close();
    }
  }

  ngOnDestroy() {
    this.destoryStripeElements();
    clearInterval(this.themeInterval);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private destoryStripeElements() {
    this.cardNumber?.unmount();
    this.cardExpiry?.unmount();
    this.cardCvc?.unmount();
    this.cardNumber?.destroy();
    this.cardExpiry?.destroy();
    this.cardCvc?.destroy();
  }
}
