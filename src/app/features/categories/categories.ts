import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../core/products.service';
import { Product } from '../home/product';
import { Loader } from "../../shared/loader/loader";
import { ProductCard } from "../../shared/product-card/product-card";
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { PaginationService } from '../../core/pagination.service';
import { FormsModule } from "@angular/forms";
import { map, Observable, tap } from 'rxjs';


@Component({
  selector: 'app-categories',
  imports: [Loader, ProductCard, MatSliderModule, CommonModule, FormsModule],
  templateUrl: './categories.html',
  standalone: true,
  styleUrl: './categories.scss'
})
export class Categories {
  productsService = inject(ProductsService);
  rating = signal<number>(0)
  searchText = signal<string>('');
  selectedCategory : any = 'All';
  minPrice = signal<number>(0);
  maxPrice = signal<number>(10000);
  isProductsLoaded=signal<boolean>(false);
  paginationService = inject(PaginationService);
  showedPages = signal<number[]>([]);
  allPages =signal<number[]>([]);
  currentPage=signal<number>(1);
  categories!: Observable<string[]>;
  filteredProducts! : Observable<Product[]>;

  ngOnInit(){
    this.categories = this.productsService.readAllCategories();
    this.filteredProducts = this.productsService.getAllProducts().pipe(
    tap((products) =>
      {
        this.paginationService.allProducts = products
        this.paginationService.initializePagination();
        this.showFilteration();
    })
    ,map(() => this.paginationService.showedProducts)
    ,tap(() => {
      this.isProductsLoaded.set(true);
    }));
  }

  filterProducts(){
    this.isProductsLoaded.set(false);
    this.filteredProducts = this.productsService.filterAllProducts(
        this.searchText(),
        this.minPrice(),
        this.maxPrice(),
        this.selectedCategory,
        this.rating,
    ).pipe(
      map((products) =>{

        return products;
      }),
      tap(() => {this.isProductsLoaded.set(true)})
    );
  }

  goNextPage(){
    this.filteredProducts = this.filteredProducts.pipe(
      map((products) => {
        this.paginationService.nextPage();
        products = this.paginationService.showedProducts;
        this.showFilteration();
        return products
      })
    )
  }
  goPreviousPage(){
    this.filteredProducts = this.filteredProducts.pipe(
      map((products) => {
        this.paginationService.previousPage();
        products = this.paginationService.showedProducts;
        this.showFilteration();
        return products
      })
    )
  }

  private showFilteration() {
    this.allPages.set(this.paginationService.allPages);
    this.showedPages.set(this.paginationService.showedPages);
    this.currentPage.set(this.paginationService.currentPage);
  }

  goToPage(page:number){
    this.paginationService.goToPage(page);
    this.filteredProducts = this.filteredProducts.pipe(
      map((products) => {
        this.paginationService.goToPage(page);
        products = this.paginationService.showedProducts;
        this.showFilteration();
        return products
      })
    )
  }
}
