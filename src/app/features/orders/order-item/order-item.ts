import { Component, inject, model } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Observable } from 'rxjs';
import { RouterLink } from "@angular/router";
import { Order } from '../../../core/interfaces/order';

@Component({
  selector: 'app-order-item',
  imports: [CurrencyPipe, NgClass, RouterLink],
  templateUrl: './order-item.html',
  styleUrl: './order-item.scss'
})
export class OrderItem {
  order = model<Order>();
  orderService = inject(OrderService);
  orderObs! : Observable<any>;

  changeOrderStatus(newStatus:"Pending" | "Shipped" | "Cancelled" | "Delivered"){
    let sub = this.orderService.changeStatusOrder(this.order()!.id,newStatus).subscribe({
      next : (value) =>{
          console.log('changed');
          console.log(this.order);
          sub.unsubscribe();
          
      },
    })
    console.log('clcik');
    
  }
}
