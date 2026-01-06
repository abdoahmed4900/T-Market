import { Component, effect, inject, model, signal } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { map, Observable } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';
import { OrderItem } from "./order-item/order-item";
import { Order } from '../../core/interfaces/order';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  imports: [AsyncPipe, OrderItem, NgClass,FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders {
  orderService = inject(OrderService);

  orders!: Observable<Order[]>;

  selectedStatus = signal<string>('All');

  isSeller= model<boolean>(false);

  startDate= signal<string>('');
  endDate= signal<string>('');

  constructor() {
    effect(() => {
      this.updateOrders();
    });

    this.updateOrders();
  }

  ngOnInit(): void {
    this.orders = this.orderService.getAllOrders();
    this.updateOrders();
  }

  private updateOrders(): void {
    const base$ = this.selectedStatus() === 'All'
      ? this.orderService.getAllOrders()
      : this.orderService.getOrdersByStatus(this.selectedStatus());

    this.orders = base$.pipe(
      map(orders => this.applyDateFilter(orders))
    );
  }

  private applyDateFilter(orders: Order[]): Order[] {
    if (!this.startDate() || !this.endDate()) {
      return orders;
    }

    const start = this.normalizeDate(new Date(this.startDate()));
    const end = this.normalizeDate(new Date(this.endDate()));

    return orders.filter(order => {
      const orderDate = this.normalizeDate(new Date(order.orderDate!));
      return orderDate >= start && orderDate <= end;
    });
  }

  filterWithStatus(newStatus : string){
    this.selectedStatus.set(newStatus);
    this.updateOrders();
  }

  filterByDate(){
    this.updateOrders();
  }

  normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
