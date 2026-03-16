import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faPaperPlane, faStar } from '@fortawesome/free-solid-svg-icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { Loader } from '../../shared/components/loader/loader';
import { Product } from '../../core/interfaces/product';
import { ProductsService } from '../../shared/services/products.service';
import { CartService } from '../../shared/services/cart.service';
import { ReviewService } from './services/review.service';
import { Review } from '../../core/interfaces/review';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailsSkeleton } from "./components/product-details-skeleton/product-details-skeleton";

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FaIconComponent, ReactiveFormsModule, TranslatePipe, FormsModule, ProductDetailsSkeleton],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails {
  route = inject(ActivatedRoute);

  productsService = inject(ProductsService);
  cartService = inject(CartService);

  productObservable!: Observable<Product>;

  cartNumber = 1;

  root = document.getElementsByTagName('html')[0];
  
  starIcon = faStar;

  currentImageIndex = 0;

  imagesNumber = 0;

  isProductLoaded = signal<boolean>(false);

  commentIcon = faPaperPlane;

  reviewService = inject(ReviewService);

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
  imageWidth = signal(100);

  ngOnInit(){
    this.getProductId();
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
    this.reviewService.isProductReviewedByUser(this.productId).pipe(take(1),takeUntil(this.destroy$),).subscribe(
      {
        next : (value) => {
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
      },
    });
  }

  addToCart(){
    this.cartService.addProductToCart(this.product.id!,this.product.price,this.product.name,this.cartNumber); 
  }

  addReview(){
    console.log(this.comment);
    console.log(this.clickedStarRating());
    
    let loader = this.matDialog.open(
      Loader,{
        disableClose: true,
      }
    )
    this.reviewService.addReview(this.comment,this.clickedStarRating(),this.product.id!).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next : (value) =>{
          loader.close();
          this.reviews.set(value);
          this.isProductReviewed.set(true);
          this.comment = '';
          this.clickedStarRating.set(-1);
        },
        error : (err) =>{
          console.log(err);
          loader.close();
        },
      }
    );
  }

  isReviewdisabled(){
    return this.comment.length == 0 || this.clickedStarRating() == -1;
  }

  isYourReview(review: Review){
    return review.userId == localStorage.getItem('token');
  }

  increaseCartNumber(){
    if(this.product.stock > this.cartNumber){
      this.cartNumber++;
    }
  }
  decreaseCartNumber(){
    if(this.cartNumber != 0){
      this.cartNumber--;
    }
  }

  nextImage(){
    if(this.currentImageIndex != this.imagesNumber - 1){
      this.currentImageIndex++;
    }
  }

  prevImage(){
    if(this.currentImageIndex != 0){
      this.currentImageIndex--;
    }
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

  zoomInOnImage(){
    this.imageWidth.update((v) => v + 1);
    console.log(this.imageWidth());
    
  }
  zoomOutOnImage(){
    this.imageWidth.update((v) => v - 1);
        console.log(this.imageWidth());

  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.reviews.set([]);
  }
}
