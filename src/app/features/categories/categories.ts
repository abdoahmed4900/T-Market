import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { PaginationService } from '../../shared/services/pagination.service';
import { FormsModule } from "@angular/forms";
import { Observable, Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductCardSkeleton } from "./components/product-card-skeleton/product-card-skeleton";
import { PaginationContainer } from "../../shared/components/pagination-container/pagination-container";
import { AnimateOnScroll } from "../../shared/animate-on-scroll";


@Component({
  selector: 'app-categories',
  imports: [ProductCard, MatSliderModule, CommonModule, FormsModule, TranslatePipe, ProductCardSkeleton, PaginationContainer, AnimateOnScroll],
  templateUrl: './categories.html',
  standalone: true,
  styleUrl: './categories.scss'
})
export class Categories {
  productsService = inject(ProductsService);
  rating = signal<number>(0)
  searchText = signal<string>('');
  selectedCategory : any = 'All';
  minPrice = 0;
  maxPrice = 10000;
  isProductsLoaded=signal<boolean>(false);
  paginationService = inject(PaginationService);
  showedProducts = this.paginationService.showedProducts;
  categories!: Observable<string[]>;
  destroy$ = new Subject<void>();

  ngOnInit(){
    this.categories = this.productsService.readAllCategories();
    this.paginationService.productsPerPage.set(1);
    this.filterProducts();
  }

  changeMinPrice(event : Event){
    this.minPrice = Number((event.target as HTMLInputElement).value);
    this.filterProducts();
  }
  changeMaxPrice(event : Event){
    this.maxPrice = Number((event.target as HTMLInputElement).value);
    this.filterProducts();
  }

  filterProducts(){
    setTimeout(() => {},400);
    this.isProductsLoaded.set(false);
    this.productsService.filterAllProducts(
        this.searchText(),
        this.minPrice,
        this.maxPrice,
        this.selectedCategory,
        this.rating(),
    ).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next : (products) => {  
           this.paginationService.reset();
           this.paginationService.allProducts.set(products);
           this.paginationService.initializePagination()
           this.isProductsLoaded.set(true);
        },
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
