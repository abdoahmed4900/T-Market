import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { PaginationService } from '../../shared/services/pagination.service';
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductCardSkeleton } from "./components/product-card-skeleton/product-card-skeleton";
import { PaginationContainer } from "../../shared/components/pagination-container/pagination-container";
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-categories',
  providers: [PaginationService],
  imports: [ProductCard, MatSliderModule, CommonModule, FormsModule, TranslateModule, ProductCardSkeleton, PaginationContainer, AnimateOnScroll],
  templateUrl: './categories.html',
  standalone: true,
  styleUrl: './categories.scss'
})
export class Categories {
  productsService = inject(ProductsService);
  rating = signal<number>(0)
  searchText = signal<string>('');
  selectedCategory: any = 'All';
  minPrice = 0;
  maxPrice = 10000;
  isProductsLoaded = signal<boolean>(false);
  paginationService = inject(PaginationService);
  showedProducts = this.paginationService.showedProducts;
  categories!: string[];
  destroy$ = new Subject<void>();
  activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.productsService.readAllCategories().pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          this.categories = value;
        },
      }
    );
    let category = this.activatedRoute.snapshot.paramMap.get('category') ?? 'All';
    this.selectedCategory = category
    this.filterProducts();
  }

  changeMinPrice(event: Event) {
    this.minPrice = Number((event.target as HTMLInputElement).value);
    this.filterProducts();
  }
  changeMaxPrice(event: Event) {
    this.maxPrice = Number((event.target as HTMLInputElement).value);
    this.filterProducts();
  }

  filterProducts() {
    this.isProductsLoaded.set(false);
    if (isFinite(this.minPrice) && isFinite(this.maxPrice) && this.selectedCategory != '') {

      this.productsService.filterAllProducts(
        this.searchText(),
        this.minPrice,
        this.maxPrice,
        this.selectedCategory,
        this.rating(),
      ).pipe(takeUntil(this.destroy$)).subscribe(
        {
          next: (products) => {
            this.paginationService.productsPerPage.set(6);
            this.paginationService.reset();
            this.paginationService.allProducts.set(products);
            this.paginationService.initializePagination()
            this.isProductsLoaded.set(true);
          },
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
