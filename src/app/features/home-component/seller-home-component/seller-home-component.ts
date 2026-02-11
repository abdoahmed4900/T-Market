import { Component, inject, signal } from '@angular/core';
import { Seller } from '../../auth/user';
import { HomeService } from '../home.service';
import { combineLatest, map, Observable, startWith, Subject, takeUntil, tap } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Loader } from "../../../shared/loader/loader";
import { Chart, registerables } from 'chart.js';
import { Product } from '../../../core/interfaces/product';
import { ProductsService } from '../../../core/services/products.service';
import { TranslatePipe } from '@ngx-translate/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Sidebar } from "../../../shared/sidebar/sidebar";
import { RouterLink } from "@angular/router";
Chart.register(...registerables);

@Component({
  selector: 'app-seller-home-component',
  imports: [AsyncPipe, CurrencyPipe, Loader, TranslatePipe, Sidebar, RouterLink],
  templateUrl: './seller-home-component.html',
  styleUrl: './seller-home-component.scss'
})
export class SellerHomeComponent {
  user!: Observable<Seller>;
  sellerProducts!: Observable<Product[]>;
  homeSerivce = inject(HomeService);
  productSerivce = inject(ProductsService);
  cancelledOrdersNum = signal<number>(0);
  shippedOrdersNum = signal<number>(0);
  deliveredOrdersNum = signal<number>(0);
  pendingOrdersNum = signal<number>(0);
  chartInstance: Chart | null = null;
  pieChartInstance: Chart | null = null;
  isChartInitialized: boolean = false;
  showSidebar = signal(true);
  breakpoints = inject(BreakpointObserver);
  destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.user = this.homeSerivce.getUser().pipe(
      tap((user) => {
        this.getSellerItems();
      }),
    );
    this.loadLayout();
  }
  private getSellerItems() {
    console.log('in here');    
    this.sellerProducts = this.productSerivce.getAllProducts().pipe(
      map((products) => {
        products = products.filter((product) => product.sellerId == localStorage.getItem('token'));
        console.log(products);
        
        return products;
      })
    );
  }

   private loadLayout() {
    combineLatest([
      this.breakpoints.observe(['(min-width: 1024px)']).pipe(
        startWith({ matches: window.innerWidth >= 1024 } as BreakpointState) 
      ),
    ])
    .pipe(
      takeUntil(this.destroy$),
    )
    .subscribe(([screen]) => {
      const isSidebar = screen.matches;
      this.showSidebar.set(isSidebar);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
