import { Component, inject, model, signal } from '@angular/core';
import { OrderService } from '../../shared/services/order.service';
import { Observable, tap } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Order } from '../../core/interfaces/order';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PaginationService } from '../../shared/services/pagination.service';
import { OrderItem } from './components/order-item/order-item';
import { OrderItemSkeleton } from "./components/order-item-skeleton/order-item-skeleton";
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { PaginationContainer } from "../../shared/components/pagination-container/pagination-container";

@Component({
  selector: 'app-orders',
  providers: [PaginationService],
  imports: [AsyncPipe, OrderItem, FormsModule, TranslatePipe, FormsModule, CommonModule, OrderItemSkeleton, AnimateOnScroll, PaginationContainer],
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

  paginationService = inject(PaginationService);
  showedProducts = signal<Order[]>([]);
  isLoaded = signal(false);

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
    this.ordersList = this.orderService.sortProducts(this.selectedSortingOption()).pipe(
      tap((orders) => {
        this.isLoaded.set(false);
        this.paginationService.reset();
        this.paginationService.productsPerPage.set(4);
        this.paginationService.allProducts.set(orders);
        this.paginationService.initializePagination();
        this.showedProducts = this.paginationService.showedProducts;
        this.isLoaded.set(true);
      })
    )
  }

  setStatus(newStatus : string){
    this.orderService.setStatus(newStatus);
    this.selectedStatus.set(newStatus);
    this.applyFilters();
  }

  setStartDate(val:string){
    this.orderService.setStartDate(val)
    this.applyFilters();
  }
  setEndDate(val:string){
    this.orderService.setEndDate(val)
    this.applyFilters();
  }
}
