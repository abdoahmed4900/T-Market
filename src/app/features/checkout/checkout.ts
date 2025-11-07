import { CartSummaryCard } from './../cart/cart-summary-card/cart-summary-card';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { StripeComponent } from "../payment/payment.component";

@Component({
  selector: 'app-checkout',
  imports: [CartSummaryCard,
    ReactiveFormsModule,
    MatInputModule, StripeComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
 
}
