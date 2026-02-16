import { Component, inject, signal } from '@angular/core';
import { Subject, take } from 'rxjs';
import { Product } from '../../core/interfaces/product';
import { WishlistService } from './wishlist.service';
import { CurrencyPipe } from '@angular/common';
import { Loader } from "../../shared/components/loader/loader";
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-wishlist',
  imports: [Loader, FaIconComponent,CurrencyPipe,TranslatePipe],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist {
  wishList= signal<Product[]>([]);
  wishListService = inject(WishlistService)
  heartIcon = faHeart;
  isListLoaded = signal(false);
  wishListSub = new Subject();

  ngOnInit(): void {
    this.wishListService.getWishList().pipe(take(1)).subscribe(
      {
        next : (value) => {
          this.wishList.set(value);
          this.isListLoaded.set(true);
        },
      }
    );
  }

  async removeFromWishList(id:string){
    await this.wishListService.removeFromWishList(id);
    this.wishList.update(list =>
        list.filter(product => product.id !== id)
    );
  }

  ngOnDestroy(): void {
    this.wishListSub.next(1);
  }
}
