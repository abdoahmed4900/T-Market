import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../core/products.service';
import { Product } from '../home/product';
import { Loader } from "../../shared/loader/loader";
import { ProductCard } from "../../shared/product-card/product-card";
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { PaginationService } from '../../core/pagination.service';


@Component({
  selector: 'app-categories',
  imports: [Loader, ProductCard,MatSliderModule,CommonModule],
  templateUrl: './categories.html',
  standalone: true,
  providers: [
    { provide: 'product', useValue: []}
  ],
  styleUrl: './categories.scss'
})
export class Categories {
  productsService = inject(ProductsService);
  filteredProducts! : Product[];
  categories!: string[];
  rating: any = 0;
  searchText = '';
  selectedCategory = 'All';
  minPrice = 0;
  maxPrice = 10000;
  productsNumber! : number;
  isProductsLoaded=signal<boolean>(false);
  paginationService = inject(PaginationService);
  showedProducts =signal<Product[]>([]);
  showedPages = signal<number[]>([]);
  allPages =signal<number[]>([]);
  currentPage=signal<number>(1);

  ngOnInit(): void {
    this.productsService.readAllCategories();
    this.productsService.products.subscribe({
      next:(value) =>{
          this.isProductsLoaded.set(true);
          this.filteredProducts = value;
          this.paginationService.allProducts = this.filteredProducts;
          this.paginationService.initializePagination();
          this.showFilteration();
          console.log(this.filteredProducts);
          
      },
      error :(err) =>{
          this.isProductsLoaded.set(true);
          console.log(err);
          
      },
    });
    this.categories = this.productsService.categories;
    
  }

  filterProducts(){
    this.isProductsLoaded.set(false);
    let minElement = document.getElementById('min') as HTMLInputElement;
    let maxElement = document.getElementById('max') as HTMLInputElement;
    this.minPrice = Number(minElement.value) ?? 0;
    this.maxPrice = Number(maxElement.value) ?? 10000;
    this.searchText = (document.getElementById('search') as HTMLInputElement).value;
    this.selectedCategory = (document.getElementById('categories') as HTMLInputElement).value;
    this.rating = Number((document.getElementById('rating') as HTMLInputElement).value) ?? 0;
    
    this.productsService.filterAllProducts(
        this.searchText,
        this.minPrice,
        this.maxPrice,
        this.selectedCategory,
        this.rating,
    ).subscribe({
      next : (value) => {
          this.isProductsLoaded.set(true);
          this.filteredProducts = value ?? [];
          this.paginationService.allProducts = this.filteredProducts;
          this.paginationService.initializePagination();
          this.showFilteration();
          console.log(this.filteredProducts);
      },
      error : (err) =>{
          this.isProductsLoaded.set(true);
          this.filteredProducts = [];
          console.log(err);
      },
    });
    
  }

   goNextPage(){
    this.paginationService.nextPage();
    this.showFilteration();
  }
  goPreviousPage(){
    this.paginationService.previousPage();
    this.showFilteration();
    console.log(this.showedProducts());
  }

  private showFilteration() {
    this.showedProducts.set(this.paginationService.showedProducts);
    this.allPages.set(this.paginationService.allPages);
    this.showedPages.set(this.paginationService.showedPages);
    this.currentPage.set(this.paginationService.currentPage);
  }

  goToPage(page:number){
    this.paginationService.goToPage(page);
    this.allPages.set(this.paginationService.allPages);
    this.currentPage.set(page);
    this.showedProducts.set(this.paginationService.showedProducts);
  }
}
