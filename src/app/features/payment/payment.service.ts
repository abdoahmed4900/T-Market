import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stripe, StripeCardNumberElement } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })
export class StripeService {
    constructor(private http: HttpClient) { }

    async makePaymentWithCard(amount: number, card: StripeCardNumberElement, stripe: Stripe,name:string) {

        const response: any = await this.http.post('http://localhost:4242/api/create-payment-intent', {
            amount: amount * 100
        }).toPromise();

        const clientSecret = response.clientSecret;

        const result = await stripe!.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    name: name
                },
            },
        });


        return result;
    }
}
