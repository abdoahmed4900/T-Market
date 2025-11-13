import { Component, inject, signal } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';
import { OrderItem } from "./order-item/order-item";
import { Order } from '../../core/interfaces/order';

@Component({
  selector: 'app-orders',
  imports: [AsyncPipe, OrderItem, NgClass],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders {
  orderService = inject(OrderService);

  orders!: Observable<Order[]>;

  selectedStatus = signal<string>('All')

  ngOnInit(): void {
    this.orders = this.orderService.getAllOrders();
  }

  changeStatus(newStatus : string){
    this.selectedStatus.set(newStatus);
    if(newStatus == 'All'){
      this.orders = this.orderService.getAllOrders();
    }else{
      this.orders = this.orderService.getOrdersByStatus(newStatus);
    }
  }
}
