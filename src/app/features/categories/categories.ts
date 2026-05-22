import { Component, computed, inject, signal } from '@angular/core';
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
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faSearch, faTags, faDollarSign, faStar, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { MatSelect, MatOption } from "@angular/material/select";


@Component({
  selector: 'app-categories',
  providers: [],
  imports: [ProductCard, MatSliderModule, CommonModule, FormsModule, TranslateModule, ProductCardSkeleton, PaginationContainer, AnimateOnScroll, FormsModule, FaIconComponent, MatSelect, MatOption],
  templateUrl: './categories.html',
  standalone: true,
  styleUrl: './categories.scss'
})
export class Categories {
  productsService = inject(ProductsService);
  rating = signal<number>(0)
  searchText = signal<string>('');
  selectedCategory = signal('All');
  minPrice = 0;
  maxPrice = 10000;
  paginationService = inject(PaginationService);
  showedProducts = computed(() => this.paginationService.showedProducts());
  categories!: string[];
  destroy$ = new Subject<void>();
  activatedRoute = inject(ActivatedRoute);

  // In your component
  searchIcon = faSearch;
  categoryIcon = faTags;
  priceIcon = faDollarSign;
  starIcon = faStar;
  emptyIcon = faBoxOpen;
  isLoading = signal(true);

  ngOnInit() {
    this.paginationService.reset();
    this.productsService.readAllCategories().pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          this.categories = value;
        },
      }
    );
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(
      (val) => {
        this.selectedCategory.set(val.get('category') ?? 'All')
        this.filterProducts();
      }
    )
  }

  changeCategory(event: any) {
    let oldCategory = this.selectedCategory();
    let newCategory = event.value;
    this.selectedCategory.set(newCategory);
    if (oldCategory.toLowerCase() != newCategory.toLowerCase()) {
      this.filterProducts();
    }
  }

  changeStarRating(event: Event) {
    if (this.rating() != Number((event.target as HTMLInputElement).value)) {
      this.rating.set(Number((event.target as HTMLInputElement).value));
      this.filterProducts();
    }
  }
  changeSearchText(event: Event) {
    this.searchText.set(String((event.target as HTMLInputElement).value));
    this.filterProducts();
  }

  changeMinPrice(event: Event) {
    if (Number((event.target as HTMLInputElement).value) != this.minPrice) {
      this.minPrice = Number((event.target as HTMLInputElement).value);
      this.filterProducts();
    }
  }
  changeMaxPrice(event: Event) {
    if (Number((event.target as HTMLInputElement).value) != this.maxPrice) {
      this.maxPrice = Number((event.target as HTMLInputElement).value);
      this.filterProducts();
    }
  }

  filterProducts() {
    if (isFinite(this.minPrice) && isFinite(this.maxPrice) && this.selectedCategory() != '') {
      this.isLoading.set(true);
      this.paginationService.reset();
      this.productsService.filterAllProducts(
        this.searchText(),
        this.minPrice,
        this.maxPrice,
        this.selectedCategory(),
        this.rating(),
      ).pipe(takeUntil(this.destroy$)).subscribe(
        {

          next: (products) => {
            this.isLoading = signal(false);
            this.paginationService.productsPerPage.set(6);
            this.paginationService.initializePagination(products)
          },
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.paginationService.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
