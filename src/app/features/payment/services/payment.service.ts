import { EmailService } from './email.service';
import { FirebaseErrorService } from '../../../core/services/firebase.error.service';
import { fireStoreCollections } from '../../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentIntentResult, Stripe, StripeCardNumberElement } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { doc } from '@angular/fire/firestore';
import { CartService } from '../../../shared/services/cart.service';
import { Buyer } from '../../auth/user';
import { FormGroup } from '@angular/forms';
import { Order } from '../../../core/interfaces/order';
import { runTransaction } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class StripeService {
  constructor(private http: HttpClient) { }

  cartService = inject(CartService);
  emailService = inject(EmailService);
  firebaseErrorService = inject(FirebaseErrorService);

  stripeElementCard!: StripeCardNumberElement;
  stripe!: Stripe;

  setStripeAndCard(stripe: Stripe, stripeElementCard: StripeCardNumberElement) {
    this.stripe = stripe;
    this.stripeElementCard = stripeElementCard;
  }


  async createPaymentIntent(amount: number, name: string) {

    try {
      const response: any = await firstValueFrom(this.http.post('https://backend-weld-two-98.vercel.app/api/create-payment-intent', {
        amount: amount * 100
      }));


      const clientSecret = response.clientSecret;

      const result = await this.stripe!.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.stripeElementCard,
          billing_details: {
            name: name
          },
        },
      });
      return result;
    } catch (error) {
      this.firebaseErrorService.handleError(error);
      throw error;
    }
  }

  async finishPayment(result: PaymentIntentResult, paymentFormGroup: FormGroup, price: number) {
    try {
      let uid = localStorage.getItem('token');
      const newOrder: Order = await this.createOrderDetails(uid, result, price, paymentFormGroup);
      this.emailService.sendEmail(`Order Confirmation - ${newOrder.id}`, this.emailService.formatOrderEmail(newOrder));
      this.cartService.clearCart();
      return newOrder;
    } catch (error) {
      this.firebaseErrorService.handleError(error);
      throw error;
    }
  }

  private async createOrderDetails(uid: string | null, result: PaymentIntentResult, price: number, paymentFormGroup: FormGroup<any>) {
    return await runTransaction(this.cartService.fireStore, async (transaction) => {

      const userRef = doc(this.cartService.fireStore, fireStoreCollections.users, uid!);
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.data() as Buyer;

      const newOrder: Order = {
        id: result.paymentIntent!.id,
        totalPrice: price,
        address: `${paymentFormGroup.get('zipCode')?.value},${paymentFormGroup.get('street')?.value},${paymentFormGroup.get('city')?.value}`,
        status: 'PENDING',
        orderDate: new Date().toDateString(),
        totalQuantity: this.cartService.totalCartProductsNumber$.value,
        items: userData.cartProducts?.map(p => ({
          name: p.name,
          price: p.price,
          id: p.id,
          quantity: p.quantity,
        })) ?? [],
      };


      let ref = doc(this.cartService.fireStore, fireStoreCollections.orders, result.paymentIntent?.id!)
      await transaction.set(ref, { ...newOrder, userId: uid })
      await transaction.update(userRef, { ordersIds: [...userData.ordersIds, newOrder.id], cartProducts: [] },);
      return newOrder;
    });
  }
}
