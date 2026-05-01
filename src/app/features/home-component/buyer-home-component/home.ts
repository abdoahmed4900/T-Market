// buyer-home.component.ts
import { Component, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { ProductsService } from '../../../shared/services/products.service';
import { CommonModule } from '@angular/common';
import { AnimateOnScroll } from "../../../shared/animate-on-scroll";
import { Observable, Subject, takeUntil } from 'rxjs';
import { Product } from '../../../core/interfaces/product';
import { RouterLink } from "@angular/router";
import { Brand } from '../../brands/interfaces/brand';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-buyer-home-component',
  imports: [CommonModule, AnimateOnScroll, RouterLink, TranslateModule],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class BuyerHomeComponent implements OnInit, OnDestroy {
  productService = inject(ProductsService);
  allProducts!: Observable<Product[]>;
  categories: string[] = [];
  brands: Brand[] = [];

  categoryCounts = new Map<string, number>();
  brandCounts = new Map<string, number>();
  isLoading = signal(true);

  destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      console.log(this.isLoading());

    })
  }

  ngOnInit(): void {
    this.allProducts = this.productService.getAllProducts();
    this.loadCategories();
    this.loadBrands();
  }

  private loadCategories() {
    this.productService.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories = categories;
        this.checkLoadingComplete();

      });
  }
  private loadBrands() {
    this.productService.brands$
      .pipe(takeUntil(this.destroy$))
      .subscribe(brands => {
        this.brands = brands;
        this.checkLoadingComplete();
      });
  }


  private checkLoadingComplete() {
    if (this.categories.length > 0 && this.brands.length > 0) {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}