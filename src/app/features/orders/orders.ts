import { Component, inject, model, signal } from '@angular/core';
import { OrderService } from '../../shared/services/order.service';
import { map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { OrderItem } from "./order-item/order-item";
import { Order } from '../../core/interfaces/order';
import { FormsModule } from '@angular/forms';
import { Loader } from "../../shared/components/loader/loader";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-orders',
  imports: [AsyncPipe, OrderItem, FormsModule, Loader,TranslatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders {
  orderService = inject(OrderService);

  orders!: Observable<Order[]>;

  selectedStatus = signal<string>('All');
  ordersList!: Order[];

  isAdmin= model<boolean>(false);
  isFiltered = signal(false);

  startDate= signal<string>('');
  endDate= signal<string>('');
  role = signal<string>(localStorage.getItem('role') || '');

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters() {
    this.isFiltered.set(false);
    if (this.selectedStatus() != 'All') {
        this.orders = this.orders.pipe(
          map((o) => {
            o = o.filter(
                order => order.status == this.selectedStatus()
            );
            return o;
          })
        )
    }else{
      this.orders = this.orderService.getMyOrders();
    }

    if (this.startDate()) {
        this.orders = this.orders.pipe(
          map((o) => {
            o = o.filter(
                order => this.normalizeDate(new Date(order.orderDate!)) >= this.normalizeDate(new Date(this.startDate()))
            );
            return o;
          })
        )
    }

    if(this.endDate()){
      this.orders = this.orders.pipe(
          map((o) => {
            o = o.filter(
                order => this.normalizeDate(new Date(order.orderDate!)) <= this.normalizeDate(new Date(this.endDate()))
            );
            return o;
          })
        )
    }
    this.isFiltered.set(true);
  }

  setStatus(newStatus : string){
    this.selectedStatus.set(newStatus);
    this.applyFilters();
  }

  setStartDate(val:string){
    this.startDate.set(val);
    this.applyFilters();
  }
  setEndDate(val:string){
    this.endDate.set(val);
    this.applyFilters();
  }

  normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
