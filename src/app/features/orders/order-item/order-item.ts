import { Component, computed, inject, model, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Observable } from 'rxjs';
import { RouterLink } from "@angular/router";
import { Order } from '../../../core/interfaces/order';

@Component({
  selector: 'app-order-item',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './order-item.html',
  styleUrl: './order-item.scss'
})
export class OrderItem {
  order = model<Order>();
  orderService = inject(OrderService);
  orderObs! : Observable<any>;
  role = signal<string>(localStorage.getItem('role') || '');
  isAdmin = computed(() => this.role() == 'admin');

  changeOrderStatus(newStatus:"Pending" | "Shipped" | "Cancelled" | "Delivered"){
    if(this.role() == 'admin'){
       let sub = this.orderService.changeStatusOrder(this.order()!.id,newStatus).subscribe({
       next : (value) =>{
          sub.unsubscribe();
       },
      }); 
    }   
  }
}
