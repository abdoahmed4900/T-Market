import { Component, inject, model, signal } from '@angular/core';
import { OrderService } from '../../shared/services/order.service';
import { Observable, tap } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Order } from '../../core/interfaces/order';
import { FormsModule } from '@angular/forms';
import { Loader } from "../../shared/components/loader/loader";
import { TranslatePipe } from '@ngx-translate/core';
import { PaginationService } from '../../shared/services/pagination.service';
import { OrderItem } from './components/order-item/order-item';

@Component({
  selector: 'app-orders',
  imports: [AsyncPipe, OrderItem, FormsModule, Loader, TranslatePipe,FormsModule,CommonModule],
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
  showedOrders= signal([] as Order[]);
  allPages = signal([] as number[]);
  showedPages = signal([] as number[]);
  allOrders = signal([] as Order[]);
  currentPage = signal(0);

  ngOnInit(): void {
    this.applyFilters();
    this.paginationService.productsPerPage = 2;
  }

  nextPage(){
    this.paginationService.nextPage();
    this.changeShowedOrder();
  }

  previousPage(){
    this.paginationService.previousPage();
    this.changeShowedOrder();
  }

  goToPage(page:number){
    this.paginationService.goToPage(page);
    this.changeShowedOrder();
  }

  private changeShowedOrder() {
    this.currentPage.set(this.paginationService.currentPage);
    this.showedPages.set(this.paginationService.showedPages);
    this.allPages.set(this.paginationService.allPages);
    this.allOrders.set(this.paginationService.allProducts);
    this.showedOrders.set(this.paginationService.showedProducts);
  }

  selectSortOption(value:string){
    this.selectedSortingOption.set(value)
    this.currentPage.set(this.paginationService.currentPage);
  }


  applyFilters() {
    this.ordersList = this.orderService.filterProducts();
    this.sortBy();
  }

  sortBy(){
    this.ordersList = this.orderService.sortProducts(this.selectedSortingOption()).pipe(
      tap((orders) => {
        this.paginationService.allProducts = orders;
        this.paginationService.initializePagination();
        this.changeShowedOrder();
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
