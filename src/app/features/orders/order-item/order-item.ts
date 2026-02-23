import { Component, computed, inject, model, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../../shared/services/order.service';
import { RouterLink } from "@angular/router";
import { Order } from '../../../core/interfaces/order';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { normalizeDate } from '../../../core/utils';

@Component({
  selector: 'app-order-item',
  imports: [CurrencyPipe, RouterLink,TranslatePipe],
  templateUrl: './order-item.html',
  styleUrl: './order-item.scss'
})
export class OrderItem {
  order = model<Order>();
  orderService = inject(OrderService);
  ordersSub!: Subscription;
  role = signal<string>(localStorage.getItem('role') || '');
  isAdmin = computed(() => this.role() == 'admin');

  modifyOrderDate(){
    return normalizeDate(new Date(this.order()?.orderDate!));
  }

  changeOrderStatus(newStatus:"PENDING" | "SHIPPED" | "CANCELLED" | "DELIVERED"){
     if (this.role() === 'admin') {
      console.log('is admin');
      
       this.ordersSub = this.orderService
        .changeStatusOrder(this.order()!.id, newStatus).subscribe();
     }  
  }

  ngOnDestroy(): void {
    this.ordersSub?.unsubscribe();
  }
}
