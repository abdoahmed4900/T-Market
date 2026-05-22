import { signal } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';
import { ProductsService } from '../../shared/services/products.service';
import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationContainer } from "../../shared/components/pagination-container/pagination-container";
import { RouterLink } from '@angular/router';
import { Brand } from './interfaces/brand';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowLeft, faArrowRight, faBox } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-brands',
  imports: [TranslateModule, AnimateOnScroll, PaginationContainer, RouterLink, FaIconComponent],
  providers: [PaginationService],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class Brands {

  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);
  translate = inject(TranslateService);

  brands!: Brand[];

  isLoaded = signal(false)

  destroy$ = new Subject<void>();
  isLight = signal(false)
  interval!: any;
  showedBrands = signal<Brand[]>([]);

  ngOnInit(): void {
    this.getBrands();
    this.watchThemeChanges();
    this.updateArrowDirection();

    // Listen for language changes
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateArrowDirection();
    });
  }

  watchThemeChanges() {
    this.interval = setInterval(() => {
      this.isLight.set(localStorage.getItem('theme') == 'light');
    }, 100);
  }

  getBrands() {
    this.isLoaded.set(false);
    this.productsService.readAllBrands().pipe(
      takeUntil(this.destroy$),
      tap((val) => {
        this.paginationService.reset();
        this.paginationService.productsPerPage.set(9);
        this.paginationService.initializePagination(val);
        this.showedBrands = this.paginationService.showedProducts;
        this.isLoaded.set(true);
      })
    ).subscribe(
      {
        next: (value) => {
          this.brands = value;
        },
      }
    );
  }

  private updateArrowDirection(): void {
    const currentLang = this.translate.currentLang;
    this.arrowIcon = currentLang === 'ar' ? faArrowLeft : faArrowRight;
  }

  productsIcon = faBox;
  arrowIcon = faArrowRight; // Will be updated based on language


  ngOnDestroy(): void {
    this.paginationService.reset();
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.interval);
  }
}
