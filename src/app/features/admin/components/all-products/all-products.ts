import { ProductsService } from './../../../../shared/services/products.service';
import { Component, inject, signal } from '@angular/core';
import { DashboardProductsSkeleton } from "../../../home-component/seller-home-component/components/dashboard-products-skeleton/dashboard-products-skeleton";
import { PaginationContainer } from "../../../../shared/components/pagination-container/pagination-container";
import { DashboardProduct } from "../../../home-component/seller-home-component/components/dashboard-product/dashboard-product";
import { TranslatePipe } from '@ngx-translate/core';
import { AnimateOnScroll } from '../../../../shared/animate-on-scroll';
import { PaginationService } from '../../../../shared/services/pagination.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-all-products',
  providers: [PaginationService],
  imports: [DashboardProductsSkeleton, PaginationContainer, DashboardProduct,TranslatePipe,AnimateOnScroll],
  templateUrl: './all-products.html',
  styleUrl: './all-products.scss',
})
export class AllProducts {

  isProductsLoaded = signal(false);

  paginationSerivce = inject(PaginationService);

  showedProducts = this.paginationSerivce.showedProducts;

  destroy$ = new Subject<void>();

  productsService = inject(ProductsService);

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(){
    this.isProductsLoaded.set(false);
    this.productsService.getAllProducts().pipe(
      takeUntil(this.destroy$),
    ).subscribe(
      {
        next : (products) =>{ 
          this.paginationSerivce.reset();
          this.paginationSerivce.productsPerPage.set(2);
          this.paginationSerivce.allProducts.set(products);
          this.paginationSerivce.initializePagination();
          this.isProductsLoaded.set(true);
        },
      }
    )
  }

  ngOnDestroy(): void {
    this.paginationSerivce.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
