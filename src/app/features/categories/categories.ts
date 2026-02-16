import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { Loader } from "../../shared/components/loader/loader";
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { PaginationService } from '../../shared/services/pagination.service';
import { FormsModule } from "@angular/forms";
import { map, Observable } from 'rxjs';
import { Product } from '../../core/interfaces/product';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductCard } from '../../shared/components/product-card/product-card';


@Component({
  selector: 'app-categories',
  imports: [Loader, ProductCard, MatSliderModule, CommonModule, FormsModule,TranslatePipe],
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
  showedPages = signal<number[]>([]);
  allPages =signal<number[]>([]);
  currentPage=signal<number>(1);
  categories!: Observable<string[]>;
  filteredProducts! : Observable<Product[]>;

  ngOnInit(){
    this.categories = this.productsService.readAllCategories();
    this.filteredProducts = this.productsService.getAllProducts().pipe(
    map((products) => {
      this.paginationService.allProducts = products
      this.paginationService.initializePagination();
      this.showFilteration();
      this.isProductsLoaded.set(true);
      console.log(this.isProductsLoaded());
      products = this.paginationService.showedProducts;
      return products;
    }));
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
    console.log(this.searchText());
    console.log(this.minPrice);
    console.log(this.maxPrice);
    console.log(this.selectedCategory);
    console.log(this.rating());
    
    this.filteredProducts = this.productsService.filterAllProducts(
        this.searchText(),
        this.minPrice,
        this.maxPrice,
        this.selectedCategory,
        this.rating(),
    ).pipe(
      map((products) =>{
        this.paginationService.allProducts = products;
        this.paginationService.initializePagination()
        this.showFilteration();
        this.isProductsLoaded.set(true);
        products = this.paginationService.showedProducts;
        return products;
      }),
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
