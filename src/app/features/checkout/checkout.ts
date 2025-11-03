import { CartSummaryCard } from './../cart/cart-summary-card/cart-summary-card';
import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { StripePaymentElementComponent } from 'ngx-stripe';
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
    @ViewChild(StripePaymentElementComponent)
    paymentElement!: StripePaymentElementComponent;

    private readonly fb = inject(UntypedFormBuilder);

    
}
