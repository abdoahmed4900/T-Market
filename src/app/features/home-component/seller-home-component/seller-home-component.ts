import { Component, HostListener, inject, signal } from '@angular/core';
import { Seller } from '../../auth/user';
import { HomeService } from '../../../core/services/home.service';
import { Observable, Subject } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Product } from '../../../core/interfaces/product';
import { ProductsService } from '../../../shared/services/products.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Sidebar } from '../../../core/components/sidebar/sidebar';
import { SellerProducts } from "./components/seller-product/seller-products";
import { AnimateOnScroll } from '../../../shared/animate-on-scroll';
Chart.register(...registerables);

@Component({
  selector: 'app-seller-home-component',
  imports: [AsyncPipe, CurrencyPipe,TranslatePipe, Sidebar, SellerProducts,AnimateOnScroll],
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
  destroy$ = new Subject<void>();
  showSidebar = signal(true);


  ngOnInit(): void {
    this.user = this.homeSerivce.getUser();
  }

  @HostListener('window:resize',[])
  setWidth(){
    if(window.innerWidth >= 1024){
      this.showSidebar.set(true)
    }
  }
}
