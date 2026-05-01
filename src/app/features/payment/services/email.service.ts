import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Order } from "../../../core/interfaces/order";
import { firstValueFrom, map } from "rxjs";
import { HomeService } from "../../../core/services/home.service";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class EmailService {

  httpService = inject(HttpClient);
  homeService = inject(HomeService);

  async sendEmail(name: string, message: string) {
    let email = localStorage.getItem('email');

    if (!email) {
      try {
        email = await firstValueFrom(this.getUserEmail());
      } catch (error) {
        console.error('Failed to get user email:', error);
        email = '';
      }
    }
    await firstValueFrom(this.httpService.post('http://localhost:4242/api/send-email', {
      name: name,
      message: message,
      email: email
    }))
  }

  getUserEmail() {
    return this.homeService.getUser().pipe(
      map((user) => {
        return user.email;
      })
    )
  }


  formatOrderEmail(order: Order): string {
    const itemsList = order.items.map(item =>
      `  • ${item.quantity} x ${item.name} = $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    return `
      Thank you for your order!
      
      Order ID: ${order.id}
      Order Date: ${order.orderDate}
      
      Items:
      ${itemsList}
      
      -----------------------------------------------
      Total Items: ${order.totalQuantity}
      Total Price: $${order.totalPrice.toFixed(2)}
      
      Shipping Address: ${order.address}
      
      We'll notify you when your order ships.
      
      Thank you for shopping with us!
    `;
  }
}