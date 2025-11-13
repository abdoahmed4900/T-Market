import { Component, inject } from '@angular/core';
import { ProductCard } from "../../../shared/product-card/product-card";
import { ProductsService } from '../../../core/services/products.service';
import { CommonModule } from '@angular/common';
import { Loader } from "../../../shared/loader/loader";

@Component({
  selector: 'app-buyer-home-component',
  imports: [ProductCard, CommonModule, Loader],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class BuyerHomeComponent {

  productService = inject(ProductsService);

  products = this.productService.getAllProducts();
}
