import { Component, inject } from '@angular/core';
import { ProductCard } from "../../shared/product-card/product-card";
import { ProductsService } from '../../core/products.service';
import { CommonModule } from '@angular/common';
import { Loader } from "../../shared/loader/loader";

@Component({
  selector: 'app-home',
  imports: [ProductCard, CommonModule, Loader],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

  productService = inject(ProductsService);

  products = this.productService.getAllProducts();
}
