import { Component, inject, model, signal } from '@angular/core';
import { OrderService } from '../../shared/services/order.service';
import { Observable, tap } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Order } from '../../core/interfaces/order';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationService } from '../../shared/services/pagination.service';
import { OrderItem } from './components/order-item/order-item';
import { OrderItemSkeleton } from "./components/order-item-skeleton/order-item-skeleton";
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { PaginationContainer } from "../../shared/components/pagination-container/pagination-container";

import {
  faBox,
  faSort,
  faCalendarAlt,
  faFilter,
  faCheckCircle,
  faTruck,
  faTimesCircle,
  faClock,
  faChevronDown,
  faInbox
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-orders',
  providers: [PaginationService],
  standalone: true,
  imports: [AsyncPipe, OrderItem, FormsModule, TranslateModule, FormsModule, CommonModule, OrderItemSkeleton, AnimateOnScroll, PaginationContainer, FaIconComponent],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders {
  orderService = inject(OrderService);

  ordersList!: Observable<Order[]>;

  selectedSortingOption = signal('newest')


  isAdmin = model<boolean>(false);
  selectedStatus = signal<string>('All');
  role = signal<string>(localStorage.getItem('role') || '');

  paginationService = inject(PaginationService);
  showedProducts = signal<Order[]>([]);
  isLoaded = signal(false);

  // In your component
  ordersIcon = faBox;
  sortIcon = faSort;
  calendarIcon = faCalendarAlt;
  statusIcon = faFilter;
  chevronDownIcon = faChevronDown;
  emptyOrdersIcon = faInbox;

  // Status options array
  statusOptions = ['All', 'PENDING', 'CANCELLED', 'SHIPPED', 'DELIVERED'];

  // Method to get status icon
  getStatusIcon(status: string): any {
    switch (status) {
      case 'PENDING':
        return faClock;
      case 'CANCELLED':
        return faTimesCircle;
      case 'SHIPPED':
        return faTruck;
      case 'DELIVERED':
        return faCheckCircle;
      default:
        return faFilter;
    }
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  selectSortOption(value: string) {
    this.selectedSortingOption.set(value)
  }


  applyFilters() {
    this.ordersList = this.orderService.filterProducts();
    this.sortBy();
  }

  sortBy() {
    this.ordersList = this.orderService.sortProducts(this.selectedSortingOption()).pipe(
      tap((orders) => {
        this.isLoaded.set(false);
        this.paginationService.reset();
        this.paginationService.productsPerPage.set(4);
        this.paginationService.initializePagination(orders);
        this.showedProducts = this.paginationService.showedProducts;
        this.isLoaded.set(true);
      })
    )
  }

  setStatus(newStatus: string) {
    this.orderService.setStatus(newStatus);
    this.selectedStatus.set(newStatus);
    this.applyFilters();
  }

  setStartDate(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.orderService.setStartDate(value)
    this.applyFilters();
  }
  setEndDate(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.orderService.setEndDate(value)
    this.applyFilters();
  }
}
