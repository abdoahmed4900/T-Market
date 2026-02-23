import { Component, inject, model, signal } from '@angular/core';
import { OrderService } from '../../shared/services/order.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { OrderItem } from "./order-item/order-item";
import { Order } from '../../core/interfaces/order';
import { FormsModule } from '@angular/forms';
import { Loader } from "../../shared/components/loader/loader";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-orders',
  imports: [AsyncPipe, OrderItem, FormsModule, Loader, TranslatePipe,FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders {
  orderService = inject(OrderService);

  ordersList!: Observable<Order[]>;

  selectedSortingOption = signal('newest')


  isAdmin= model<boolean>(false);
  selectedStatus = signal<string>('All');
  role = signal<string>(localStorage.getItem('role') || '');

  ngOnInit(): void {
    this.applyFilters();
  }

  selectSortOption(value:string){
    this.selectedSortingOption.set(value)
  }


  applyFilters() {
    this.ordersList = this.orderService.filterProducts();
    this.sortBy();
  }

  sortBy(){
    this.ordersList = this.orderService.sortProducts(this.selectedSortingOption())
  }

  setStatus(newStatus : string){
    this.orderService.setStatus(newStatus);
    this.selectedStatus.set(newStatus);
    this.applyFilters();
    this.sortBy();
  }

  setStartDate(val:string){
    this.orderService.setStartDate(val)
    this.applyFilters();
    this.sortBy();
  }
  setEndDate(val:string){
    this.orderService.setEndDate(val)
    this.applyFilters();
    this.sortBy();
  }
}
