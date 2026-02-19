import { Component, HostListener, inject, signal } from '@angular/core';
import { Seller } from '../../auth/user';
import { HomeService } from '../../../core/services/home.service';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Product } from '../../../core/interfaces/product';
import { ProductsService } from '../../../shared/services/products.service';
import { TranslatePipe } from '@ngx-translate/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterLink } from "@angular/router";
import { Loader } from '../../../shared/components/loader/loader';
import { Sidebar } from '../../../core/components/sidebar/sidebar';
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
  }

  @HostListener('window:resize',[])
  setWidth(){
    this.showSidebar.set(window.innerWidth >= 1024);
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

  deleteProduct(productId:string){
    this.productSerivce.deleteProduct(productId).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next : (value) => {
          if(value){
            this.sellerProducts = this.sellerProducts.pipe(
              map((products) => {
                return products.filter((p) => p.id != productId); 
              })
            )
          }
        },
      }
    )
  }
  
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
