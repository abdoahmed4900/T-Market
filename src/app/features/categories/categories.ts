import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../core/products.service';
import { Product } from '../home/product';
import { Loader } from "../../shared/loader/loader";
import { ProductCard } from "../../shared/product-card/product-card";
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-categories',
  imports: [Loader, ProductCard,MatSliderModule,CommonModule],
  templateUrl: './categories.html',
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
 

  ngOnInit(): void {
    this.productsService.readAllCategories();
    this.productsService.products.subscribe({
      next:(value) =>{
          this.isProductsLoaded.set(true);
          this.filteredProducts = value;
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
    this.minPrice = Number(minElement.value);
    this.maxPrice = Number(maxElement.value);
    this.searchText = (document.getElementById('search') as HTMLInputElement).value;
    this.selectedCategory = (document.getElementById('categories') as HTMLInputElement).value;
    this.rating = Number((document.getElementById('rating') as HTMLInputElement).value);
    
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
      },
      error : (err) =>{
          this.isProductsLoaded.set(true);
          this.filteredProducts = [];
          console.log(err);
          
      },
    });
    
  }

  ngOnDestroy(): void {
    this.filteredProducts = [];
  }
}
