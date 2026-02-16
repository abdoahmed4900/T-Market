import { Component, inject, input } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Product } from '../../../core/interfaces/product';
import { WishlistService } from '../../../features/wishlist/wishlist.service';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-product-card',
  imports: [FaIconComponent, RouterLink,CommonModule,TranslatePipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  product = input<Product>();

  starIcon = faStar;

  root = document.getElementsByTagName('html')[0];

  cartService = inject(CartService);
  wishListService = inject(WishlistService);
  wishListSub! : Subscription;

  addToCart(productId:string,productPrice:number){
    this.cartService.addProductToCart(productId,productPrice,this.product()!.name);
  }

  async addToWishList(productId:string){
    await this.wishListService.addToWishList(productId);
  }
}
