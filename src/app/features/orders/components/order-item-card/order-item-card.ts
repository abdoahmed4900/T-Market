import { Component, inject, input } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsService } from '../../../../shared/services/products.service';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../core/interfaces/product';
import { DeletedProductOverlay } from "../../../../shared/components/deleted-product-overlay/deleted-product-overlay";
import { AnimateOnScroll } from "../../../../shared/animate-on-scroll";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order-item-card',
  imports: [AsyncPipe, RouterLink, CurrencyPipe, DeletedProductOverlay, AnimateOnScroll, TranslateModule],
  templateUrl: './order-item-card.html',
  styleUrl: './order-item-card.scss'
})
export class OrderItemCard {
  orderItem = input<{ price: number, name: string, quantity: number, id?: string }>();

  product!: Observable<Product>;

  productService = inject(ProductsService);

  ngOnInit(): void {
    this.product = this.productService.getProductById(this.orderItem()!.id!);
  }
}
