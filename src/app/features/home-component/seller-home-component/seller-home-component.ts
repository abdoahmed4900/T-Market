import { Component, inject, signal } from '@angular/core';
import { Seller } from '../../auth/user';
import { HomeService } from '../home.service';
import { map, Observable, tap } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Loader } from "../../../shared/loader/loader";
import { OrderService } from '../../../core/services/order.service';
import { Chart, registerables } from 'chart.js';
import { Product } from '../../../core/interfaces/product';
import { ProductsService } from '../../../core/services/products.service';
Chart.register(...registerables);

@Component({
  selector: 'app-seller-home-component',
  imports: [AsyncPipe, CurrencyPipe, Loader],
  templateUrl: './seller-home-component.html',
  styleUrl: './seller-home-component.scss'
})
export class SellerHomeComponent {
  user!: Observable<Seller>;
  sellerProducts!: Observable<Product[]>;
  homeSerivce = inject(HomeService);
  orderSerivce = inject(OrderService);
  productSerivce = inject(ProductsService);
  cancelledOrdersNum = signal<number>(0);
  shippedOrdersNum = signal<number>(0);
  deliveredOrdersNum = signal<number>(0);
  pendingOrdersNum = signal<number>(0);
  chartInstance: Chart | null = null;
  pieChartInstance: Chart | null = null;
  isChartInitialized: boolean = false;

  ngOnInit(): void {
    this.user = this.homeSerivce.getUser().pipe(
      tap((user) => {
        this.getSellerItems();
      }),
    );
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
}
