import { Component, HostListener, inject, signal } from '@angular/core';
import { Seller } from '../../auth/user';
import { HomeService } from '../../../core/services/home.service';
import { Observable, Subject } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Product } from '../../../core/interfaces/product';
import { ProductsService } from '../../../shared/services/products.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Loader } from '../../../shared/components/loader/loader';
import { Sidebar } from '../../../core/components/sidebar/sidebar';
import { SellerHomeSkeleton } from "./components/seller-home-skeleton/seller-home-skeleton";
import { SellerProducts } from "./components/seller-product/seller-products";
Chart.register(...registerables);

@Component({
  selector: 'app-seller-home-component',
  imports: [AsyncPipe, CurrencyPipe, Loader, TranslatePipe, Sidebar, SellerHomeSkeleton, SellerProducts],
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
  destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.user = this.homeSerivce.getUser();
  }

  @HostListener('window:resize',[])
  setWidth(){
    this.showSidebar.set(window.innerWidth >= 1024);
  }
}
