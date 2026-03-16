import { CartSummaryCard } from '../cart/components/cart-summary-card/cart-summary-card';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { PaymentComponent } from "../payment/payment.component";
import { PaymentProgressBar } from "../../shared/components/payment-progress-bar/payment-progress-bar";
import { ProgressService } from '../../shared/components/payment-progress-bar/progress.service';

@Component({
  selector: 'app-checkout',
  imports: [CartSummaryCard,
    ReactiveFormsModule,
    MatInputModule, PaymentComponent, PaymentProgressBar],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
    progressService = inject(ProgressService);

    ngOnInit(): void {
      this.progressService.goToSecondStep();
    }
}
