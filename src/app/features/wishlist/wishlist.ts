import { Component, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../core/interfaces/product';
import { WishlistService } from './wishlist.service';
import { CurrencyPipe } from '@angular/common';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { DeletedProductOverlay } from "../../shared/components/deleted-product-overlay/deleted-product-overlay";
import { ToastService } from '../../shared/services/toast.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-wishlist',
  imports: [FaIconComponent, CurrencyPipe, TranslateModule, AnimateOnScroll, DeletedProductOverlay, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist {
  wishList = signal<Product[]>([]);
  wishListService = inject(WishlistService)
  heartIcon = faHeart;
  isListLoaded = signal(false);
  destroy$ = new Subject<void>();
  translateService = inject(TranslateService);
  toastService = inject(ToastService);
  ngOnInit(): void {
    this.wishListService.getWishList().pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          this.wishList.set(value);
          this.isListLoaded.set(true);
        },
      }
    );
  }

  removeFromWishList(id: string) {
    this.wishListService.removeFromWishList(id).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.WISHLIST_ITEM_REMOVED'));
        },
      }
    );
    this.wishList.update(list =>
      list.filter(product => product.id !== id)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
