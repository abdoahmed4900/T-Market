import { Component, inject } from '@angular/core';
import { ProductsService } from '../../../shared/services/products.service';
import { CommonModule } from '@angular/common';
import { Loader } from "../../../shared/components/loader/loader";
import { ProductCard } from '../../../shared/components/product-card/product-card';

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
