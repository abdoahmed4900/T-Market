import { Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../../../shared/services/products.service';
import { Subject, takeUntil } from 'rxjs';
import { DashboardProduct } from "../dashboard-product/dashboard-product";
import { AnimateOnScroll } from "../../../../../shared/animate-on-scroll";
import { PaginationService } from '../../../../../shared/services/pagination.service';
import { PaginationContainer } from "../../../../../shared/components/pagination-container/pagination-container";
import { DeletedProductOverlay } from "../../../../../shared/components/deleted-product-overlay/deleted-product-overlay";

@Component({
  selector: 'app-seller-products',
  imports: [TranslateModule, RouterLink, DashboardProduct, AnimateOnScroll, PaginationContainer, DeletedProductOverlay],
  providers: [PaginationService],
  templateUrl: './seller-products.html',
  styleUrl: './seller-products.scss',
})
export class SellerProducts {
  productSerivce = inject(ProductsService);
  paginationSerivce = inject(PaginationService);
  showedProducts = this.paginationSerivce.showedProducts;
  destroy$ = new Subject<void>();
  isLoaded = signal(false);

  ngOnInit(): void {
    this.getSellerItems();
  }

  private getSellerItems() {
    this.isLoaded.set(false);
    this.productSerivce.getSellerProducts().pipe(
      takeUntil(this.destroy$),
    ).subscribe(
      {
        next: (value) => {
          this.paginationSerivce.reset();
          this.paginationSerivce.productsPerPage.set(3)
          this.paginationSerivce.allProducts.set(value)
          this.paginationSerivce.initializePagination();
          this.showedProducts = this.paginationSerivce.showedProducts;
          this.isLoaded.set(true);
        },
      }
    );
  }

  deleteOrUnDeleteProduct(productId: string) {
    this.productSerivce.deleteOrUnDeleteProduct(productId).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          if (value) {
            this.getSellerItems();
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
