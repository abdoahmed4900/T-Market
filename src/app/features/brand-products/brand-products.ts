import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { Component, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationContainer } from "../../shared/components/pagination-container/pagination-container";
import { AnimateOnScroll } from '../../shared/animate-on-scroll';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { DeletedProductOverlay } from "../../shared/components/deleted-product-overlay/deleted-product-overlay";
import { Product } from '../../core/interfaces/product';
import { faArrowLeft, faArrowRight, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-brand-products',
  imports: [PaginationContainer, AnimateOnScroll, TranslateModule, RouterLink, CurrencyPipe, DeletedProductOverlay, FaIconComponent],
  providers: [],
  templateUrl: './brand-products.html',
  styleUrl: './brand-products.scss',
})
export class BrandProducts {

  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);
  translate = inject(TranslateService);

  activatedRoute = inject(ActivatedRoute);
  isLoaded = this.paginationService.isLoaded;
  destroy$ = new Subject<void>();
  showedProducts = signal<Product[]>([]);
  name = signal('');

  ngOnInit(): void {
    this.name.set(this.activatedRoute.snapshot.paramMap.get('name')!);
    this.paginationService.reset();
    this.productsService.getProductsByBrand(this.name()).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          this.paginationService.productsPerPage.set(6);
          this.paginationService.initializePagination(value);
          this.showedProducts = this.paginationService.showedProducts
        },
      }
    )
  }

  arrowIcon = faArrowRight;
  emptyIcon = faBoxOpen;

  constructor() {
    this.arrowIcon = this.translate.currentLang === 'ar' ? faArrowLeft : faArrowRight;
  }


  ngOnDestroy(): void {
    this.paginationService.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
