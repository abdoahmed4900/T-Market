import { FirebaseErrorService } from '../../core/services/firebase.error.service';
import { Component, effect, ElementRef, inject, signal, ViewChild, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Loader } from '../../shared/components/loader/loader';
import { Product } from '../../core/interfaces/product';
import { ProductsService } from '../../shared/services/products.service';
import { CartService } from '../../shared/services/cart.service';
import { ReviewService } from './services/review.service';
import { Review } from '../../core/interfaces/review';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailsSkeleton } from "./components/product-details-skeleton/product-details-skeleton";
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { ToastService } from '../../shared/services/toast.service';
import { ImageZoomDirective } from "./image-zoom-directive";
import {
  faStar,
  faComment,
  faShoppingCart,
  faArrowRight,
  faArrowLeft,
  faPaperPlane,
  faSearchPlus
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FaIconComponent, ReactiveFormsModule, TranslateModule, FormsModule, ProductDetailsSkeleton, AnimateOnScroll, ImageZoomDirective],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails {
  route = inject(ActivatedRoute);

  productsService = inject(ProductsService);
  cartService = inject(CartService);

  productObservable!: Observable<Product>;

  cartNumber = 1;

  rootElement = document.getElementsByTagName('html')[0];

  starIcon = faStar;
  commentIcon = faComment;
  cartIcon = faShoppingCart;
  sendIcon = faPaperPlane;
  zoomIcon = faSearchPlus;

  // Dynamic arrow icons based on language
  prevArrowIcon = faArrowLeft;
  nextArrowIcon = faArrowRight;

  currentImageIndex = 1;

  imagesNumber = 0;

  isProductLoaded = signal<boolean>(false);

  reviewService = inject(ReviewService);
  firebaseErrorService = inject(FirebaseErrorService);

  destroy$ = new Subject<void>();

  productId = '';

  product!: Product;

  clickedStarRating = signal(-1);
  hoveredStarRating = signal(-1);
  matDialog = inject(MatDialog);
  comment = '';
  isProductReviewed = signal(false);
  reviews = signal([] as Review[]);
  commentElement = viewChild<ElementRef<HTMLInputElement>>('review');
  @ViewChild('zoom') zoomDirective!: ImageZoomDirective;
  imageScale = signal(1);
  translateService = inject(TranslateService);
  toastService = inject(ToastService);
  router = inject(Router);
  auth = inject(AuthService);
  isNormalUser = signal(this.auth.userRole() == 'buyer' || this.auth.userRole() == '')

  isBuyer = signal(this.auth.userRole() == 'buyer')

  constructor(private translate: TranslateService, private root: ElementRef) {
    // Update arrows when language changes
    this.updateArrows();
    this.translate.onLangChange.subscribe(() => {
      this.updateArrows();
    });
    effect(() => {
      this.isBuyer.set(this.auth.userRole() == 'buyer');
      this.isNormalUser.set(this.auth.userRole() == 'buyer' || this.auth.userRole() == '');
    })
  }

  private updateArrows(): void {
    const isRTL = this.translate.currentLang === 'ar';
    this.prevArrowIcon = isRTL ? faArrowRight : faArrowLeft;
    this.nextArrowIcon = isRTL ? faArrowLeft : faArrowRight;
  }

  ngOnInit() {
    this.getProductId();
  }

  getValidImageUrl(): string | null {
    // Check if product and imageUrls exist
    if (!this.product?.imageUrls || this.product.imageUrls.length === 0) {
      return null;
    }

    // Calculate the index (ensure it's valid)
    const index = this.currentImageIndex - 1;

    // Check if index is within bounds
    if (index < 0 || index >= this.product.imageUrls.length) {
      return null;
    }

    // Return the valid URL
    return this.product.imageUrls[index];
  }

  private getProductId() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe({
      next: (value) => {
        if (value.get('id')) {
          this.productId = value.get('id')!;
          this.getProductDetails();
          this.getProductReviewed();
        }
      },
    });
  }

  private getProductReviewed() {
    this.reviewService.isProductReviewedByUser(this.productId).pipe(take(1), takeUntil(this.destroy$),).subscribe(
      {
        next: (value) => {
          this.isProductReviewed.set(value);
        },
      }
    );
  }

  private getProductDetails() {
    this.productsService.getProductById(this.productId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (value) => {
        this.product = value;
        this.reviews.set(this.product.reviews ?? []);
        this.isProductLoaded.set(true);
        this.imagesNumber = value.imageUrls?.length!;
      },
    });
  }

  addToCart() {
    let id = localStorage.getItem('token');
    if (id) {
      let loader = this.matDialog.open(
        Loader,
        {
          disableClose: true,
        }
      )
      this.cartService.addProductToCart(this.product.id!, this.product.price, this.product.name, this.cartNumber).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          loader.close();
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.ITEM_ADDED_TO_CART'))
        },
        error: () => {
          loader.close();
        },
      });
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.CART') }))
      this.router.navigateByUrl('/login')
    }
  }

  addReview() {
    let id = localStorage.getItem('token');
    if (id) {
      if (this.isBuyer()) {
        let loader = this.matDialog.open(
          Loader, {
          disableClose: true,
        }
        )
        this.reviewService.addReview(this.comment, this.clickedStarRating(), this.product.id!).pipe(takeUntil(this.destroy$)).subscribe(
          {
            next: (value) => {
              this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.REVIEW_ADDED'));
              loader.close();
              this.reviews.set(value);
              this.isProductReviewed.set(true);
              this.comment = '';
              this.clickedStarRating.set(-1);
            },
            error: (err) => {
              loader.close();
            },
          }
        );
      } else {
        this.toastService.error(this.translateService.instant('ERROR_MESSAGES.NO_BUYER', { page: this.translateService.instant('PRODUCT_DETAILS.REVIEW') }))
      }
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('PRODUCT_DETAILS.REVIEW') }))
      this.router.navigateByUrl('/login')
    }
  }

  isReviewdisabled() {
    return this.comment.length == 0 || this.clickedStarRating() == -1;
  }

  isYourReview(review: Review) {
    return review.userId == localStorage.getItem('token');
  }

  increaseCartNumber() {
    let id = localStorage.getItem('token');
    if (id) {
      if (this.product.stock > this.cartNumber) {
        this.cartNumber++;
      } else {
        this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.STOCK_MAXIMUM'));
      }
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.CART') }))
      this.router.navigateByUrl('/login');
    }
  }
  decreaseCartNumber() {
    let id = localStorage.getItem('token');
    if (id) {
      if (this.cartNumber != 0) {
        this.cartNumber--;
      } else {
        this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.STOCK_MINIMUM'));
      }
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.CART') }))
      this.router.navigateByUrl('/login');
    }
  }
  nextImage() {
    if (this.currentImageIndex < this.imagesNumber) {
      this.currentImageIndex++;
    }
    this.imageScale.set(100);
  }

  prevImage() {
    if (this.currentImageIndex != 0) {
      this.currentImageIndex--;
    }
    this.imageScale.set(100);
  }

  handleStarRatingHovered(index: number) {
    this.hoveredStarRating.set(index);
  }
  handleStarRatingClicked(index: number) {
    this.clickedStarRating.set(index);
  }
  handleStarRatingOnLeave() {
    this.hoveredStarRating.set(-1);
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.reviews.set([]);
    this.currentImageIndex = 0;
    this.imagesNumber = 0;
    this.imageScale.set(100)
  }
}
