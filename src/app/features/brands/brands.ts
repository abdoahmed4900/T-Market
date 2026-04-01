import { signal } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';
import { ProductsService } from './../../shared/services/products.service';
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationContainer } from "../../shared/components/pagination-container/pagination-container";
import { RouterLink } from '@angular/router';
import { Brand } from './interfaces/brand';

@Component({
  selector: 'app-brands',
  imports: [TranslatePipe, AnimateOnScroll, PaginationContainer,RouterLink],
  providers:[PaginationService],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class Brands {

  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

  brands!: Brand[];

  isLoaded = signal(false)

  destroy$ = new Subject<void>();
  isLight = signal(localStorage.getItem('theme') == 'light')
  interval!: any;
  showedBrands = signal<Brand[]>([]);

  ngOnInit(): void {
   this.getBrands();
   this.watchThemeChanges();
  }

  watchThemeChanges(){
    this.interval = setInterval(() => {
    this.isLight.set(localStorage.getItem('theme') == 'light');
    }, 100);
  }

  getBrands(){
     this.isLoaded.set(false);
     this.productsService.readAllBrands().pipe(
      takeUntil(this.destroy$),
      tap((val) => {
        this.paginationService.reset();    
        this.paginationService.productsPerPage.set(9);
        this.paginationService.allProducts.set(val);
        this.paginationService.initializePagination();
        this.showedBrands = this.paginationService.showedProducts;
        this.isLoaded.set(true);
      })
    ).subscribe(
      {
        next : (value) =>{
          this.brands = value;
        },
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.interval);
  }
}
