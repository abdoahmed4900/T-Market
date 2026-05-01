import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { Component, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PaginationService } from '../../shared/services/pagination.service';
import { DashboardProductsSkeleton } from "../home-component/seller-home-component/components/dashboard-products-skeleton/dashboard-products-skeleton";
import { PaginationContainer } from "../../shared/components/pagination-container/pagination-container";
import { DashboardProduct } from "../home-component/seller-home-component/components/dashboard-product/dashboard-product";
import { AnimateOnScroll } from '../../shared/animate-on-scroll';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-brand-products',
  imports: [DashboardProductsSkeleton, PaginationContainer, DashboardProduct, AnimateOnScroll, TranslateModule, RouterLink],
  providers: [PaginationService],
  templateUrl: './brand-products.html',
  styleUrl: './brand-products.scss',
})
export class BrandProducts {
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

  activatedRoute = inject(ActivatedRoute);
  isLoaded = signal(false);
  destroy$ = new Subject<void>();
  showedProducts = this.paginationService.showedProducts;
  name = signal('');

  ngOnInit(): void {
    this.name.set(this.activatedRoute.snapshot.paramMap.get('name')!);
    this.productsService.getProductsByBrand(this.name()).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          this.isLoaded.set(false);
          this.paginationService.reset();
          this.paginationService.productsPerPage.set(6);
          this.paginationService.allProducts.set(value);
          this.paginationService.initializePagination();
          this.isLoaded.set(true);
        },
      }
    )
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
