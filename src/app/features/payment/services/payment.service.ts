import { fireStoreCollections } from '../../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentIntentResult, Stripe, StripeCardNumberElement } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { addDoc, collection, doc, getDoc } from '@angular/fire/firestore';
import { CartService } from '../../../shared/services/cart.service';
import { Buyer } from '../../auth/user';
import { FormGroup } from '@angular/forms';
import { Order } from '../../../core/interfaces/order';
import { updateDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class StripeService {
    constructor(private http: HttpClient) { }

    cartService = inject(CartService);

    stripeElementCard!: StripeCardNumberElement;
    stripe!: Stripe;

    setStripeAndCard(stripe:Stripe, stripeElementCard:StripeCardNumberElement){
        this.stripe = stripe;
        this.stripeElementCard = stripeElementCard;
    }


    async createPaymentIntent(amount: number, name:string) {

        const response: any = await firstValueFrom(this.http.post('http://localhost:4242/api/create-payment-intent', {
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
    }

    async finishPayment(result: PaymentIntentResult,paymentFormGroup: FormGroup,price:number) {
        try {
            let uid = localStorage.getItem('token');
            // await this.sendNotification(uid);

            const newOrder: Order = await this.createOrderDetails(uid, result, price, paymentFormGroup);
            return newOrder;
        } catch (error) {
            console.error('❌ Payment or Firestore update failed:', error);
            throw error;
        }
    }

    private async createOrderDetails(uid: string | null, result: PaymentIntentResult, price: number, paymentFormGroup: FormGroup<any>) {
        const userRef = doc(this.cartService.fireStore, fireStoreCollections.users, uid!);
        const userSnap = await getDoc(userRef);
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
        let orders = collection(this.cartService.fireStore, fireStoreCollections.orders);
        await addDoc(orders, { ...newOrder, userId: uid });
        await updateDoc(doc(this.cartService.fireStore,fireStoreCollections.users,uid!),{ ordersIds:[...userData.ordersIds,newOrder.id]},);
        this.cartService.clearCart();
        await this.updateUserOrders(newOrder);
        return newOrder;
    }

    async updateUserOrders(newOrder: Order) {
        const uid = localStorage.getItem('token');
        const userRef = doc(this.cartService.fireStore, fireStoreCollections.users, uid!);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() as Buyer;
        const updatedOrders = [...(userData.ordersIds ?? []), newOrder];
        await updateDoc(userRef, { orders: updatedOrders, cartProducts: [] });
        return userData;
    }

    private async sendNotification(uid: string | null) {
        await firstValueFrom(await this.http.post('http://localhost:4242/api/send-notification', {
            message: 'Your order has been placed successfully!',
            userId: uid,
        }));
    }
}
