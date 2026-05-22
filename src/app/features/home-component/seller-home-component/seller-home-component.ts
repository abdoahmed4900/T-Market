import { ProductsService } from './../../../shared/services/products.service';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Seller } from '../../auth/user';
import { HomeService } from '../../../core/services/home.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Product } from '../../../core/interfaces/product';
import { TranslateModule } from '@ngx-translate/core';
import { Sidebar } from '../../../core/components/sidebar/sidebar';
import { SellerProducts } from "./components/seller-product/seller-products";
import { AnimateOnScroll } from '../../../shared/animate-on-scroll';
import {
  faChartLine,
  faBoxes,
  faBox,
  faCube,
  faArrowUp,
  faTachometerAlt
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

Chart.register(...registerables);

@Component({
  selector: 'app-seller-home-component',
  imports: [AsyncPipe, CurrencyPipe, TranslateModule, Sidebar, SellerProducts, AnimateOnScroll, FaIconComponent],
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
  productsService = inject(ProductsService)

  // In your component
  dashboardIcon = faTachometerAlt;
  revenueIcon = faChartLine;
  soldIcon = faBoxes;
  productsIcon = faBox;
  stockIcon = faCube;
  trendUpIcon = faArrowUp;
  boxIcon = faBox;
  activeProductsCount = signal(0);




  ngOnInit(): void {
    this.user = this.homeSerivce.getUser();
    this.getSellerProducts()
  }

  getSellerProducts() {
    this.productSerivce.getSellerProducts().pipe(
      takeUntil(this.destroy$),
      tap((products) => {
        this.activeProductsCount.set(0);
        products.map((p) => {
          if (!p.isDeleted && p.stock > 0) {
            this.activeProductsCount.update((v) => v + 1);
          }
        })
      })
    ).subscribe()
  }


  @HostListener('window:resize', [])
  setWidth() {
    if (window.innerWidth >= 1024) {
      this.showSidebar.set(true)
    }
  }
}
