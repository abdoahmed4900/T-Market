import { Component, inject } from '@angular/core';
import { Product } from '../../../../../core/interfaces/product';
import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../../../shared/services/products.service';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { DashboardProduct } from "../dashboard-product/dashboard-product";
import { AnimateOnScroll } from "../../../../../shared/animate-on-scroll";

@Component({
  selector: 'app-seller-products',
  imports: [TranslatePipe, RouterLink, AsyncPipe, DashboardProduct, AnimateOnScroll],
  templateUrl: './seller-products.html',
  styleUrl: './seller-products.scss',
})
export class SellerProducts {
  sellerProducts!: Observable<Product[]>;
  productSerivce = inject(ProductsService);
  destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getSellerItems();
  }

  private getSellerItems() {
    this.sellerProducts = this.productSerivce.getSellerProducts();
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
    this.destroy$.next();
    this.destroy$.complete();
  }
}
