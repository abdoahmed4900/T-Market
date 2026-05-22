import { ToastService } from './../../shared/services/toast.service';
import { CartSummaryCard } from '../cart/components/cart-summary-card/cart-summary-card';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { PaymentComponent } from "../payment/payment.component";
import { PaymentProgressBar } from "../../shared/components/payment-progress-bar/payment-progress-bar";
import { ProgressService } from '../../shared/components/payment-progress-bar/progress.service';
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { CartService } from '../../shared/services/cart.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  imports: [CartSummaryCard,
    ReactiveFormsModule,
    MatInputModule, PaymentComponent, PaymentProgressBar, AnimateOnScroll],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  progressService = inject(ProgressService);
  cartService = inject(CartService)
  toastService = inject(ToastService)
  translate = inject(TranslateService)
  router = inject(Router)

  ngOnInit(): void {
    this.progressService.goToSecondStep();
  }
}
