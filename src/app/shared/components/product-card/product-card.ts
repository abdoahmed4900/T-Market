import { Component, computed, inject, input, signal } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faCartShopping, faEye, faHeart, faHeart as faHeartSolid, faStar } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Product } from '../../../core/interfaces/product';
import { WishlistService } from '../../../features/wishlist/wishlist.service';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnimateOnScroll } from '../../animate-on-scroll';
import { DeletedProductOverlay } from "../deleted-product-overlay/deleted-product-overlay";
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-product-card',
  imports: [FaIconComponent, RouterLink, CommonModule, TranslateModule, AnimateOnScroll, DeletedProductOverlay],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  product = input<Product>();

  starIcon = faStar;

  root = document.getElementsByTagName('html')[0];

  cartService = inject(CartService);
  wishListService = inject(WishlistService);
  destroy = new Subject<void>();
  isInWishList = signal(false);
  translateService = inject(TranslateService)

  matDialog = inject(MatDialog);
  toastService = inject(ToastService);
  router = inject(Router);

  // In your component
  cartIcon = faCartShopping;
  eyeIcon = faEye;

  // For wishlist heart (filled vs outlined)
  heartIcon = computed(() => {
    return this.isInWishList() ? faHeart : faHeartRegular;
  });


  ngOnInit(): void {
    this.wishListService.isProductInWishList(this.product()!.id!).pipe(takeUntil(this.destroy)).subscribe(isInWishList => {
      this.isInWishList.set(isInWishList);
    });

    this.heartIcon = computed(() => this.isInWishList() ? faHeartSolid : faHeartRegular);
  }

  addToCart(productId: string, productPrice: number) {
    let id = localStorage.getItem('token');
    if (id) {
      this.cartService.addProductToCart(productId, productPrice, this.product()!.name).pipe(takeUntil(this.destroy)).subscribe({
        next: () => {
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.ITEM_ADDED_TO_CART'));
        },
      });
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.CART') }))
      this.router.navigateByUrl('/login')
    }
  }

  toggleWishListItem(productId: string) {
    let id = localStorage.getItem('token');
    if (id) {
      if (this.isInWishList()) {
        this.wishListService.removeFromWishList(productId).pipe(takeUntil(this.destroy)).subscribe({
          next: (value) => {
            this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.WISHLIST_ITEM_REMOVED'));
            this.isInWishList.set(false);
          },
        });
      }
      else {
        this.wishListService.addToWishList(productId).pipe(takeUntil(this.destroy)).subscribe({
          next: (value) => {
            this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.WISHLIST_ITEM_ADDED'));
            this.isInWishList.set(true);
          },
        });
      }
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.WISHLIST') }))
      this.router.navigateByUrl('/login')
    }
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
