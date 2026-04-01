import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../../../shared/services/products.service';
import { numericLengthValidator } from '../../../../../core/utils';
import { firstValueFrom, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { Product } from '../../../../../core/interfaces/product';
import { ImageService } from '../../../../../shared/services/image.service';
import { GoBackButton } from "../../../../../shared/components/go-back-button/go-back-button";
import { AnimateOnScroll } from "../../../../../shared/animate-on-scroll";

@Component({
  selector: 'app-new-product',
  imports: [TranslatePipe, ReactiveFormsModule, AsyncPipe, MatSelectModule, GoBackButton, AnimateOnScroll],
  templateUrl: './new-product.html',
  styleUrl: './new-product.scss',
})
export class NewProduct {

  productService = inject(ProductsService);
  
  fb = inject(FormBuilder);
  categories!: Observable<string[]>;
  brands!: Observable<string[]>;
  selectedCategory! : string;
  selectedBrand! : string;
  imagePreviews= signal<string[]>([]);
  selectedFiles = signal<File[]>([]);
  product = signal<Product|null>(null);
  imageService = inject(ImageService);
  destroy$ = new Subject<void>()


  productFormGroup = this.fb.group({
    name: ['',[Validators.minLength(3),Validators.required]],
    description: ['',[Validators.minLength(50),Validators.required]],
    stock: [,[numericLengthValidator(2),Validators.required]],
    price: [,[numericLengthValidator(2),Validators.required]],
  })

  ngOnInit(): void {
    this.categories = this.productService.readAllCategories().pipe(
      tap((val) => {
        this.selectedCategory = val[0];
      })
    );
    this.brands = this.productService.readAllBrands().pipe(
      map((val) => {
        this.selectedBrand = val[0].brandName;
        let names : string[] = [];
        val.map((v) => {
          names.push(v.brandName);
        })
        return names;
      })
    );
  }

  selectImages(event:Event){
     const input = event.target as HTMLInputElement;

     if (!input.files?.length) return;

     let newImages = [];
     let newFiles = [];

     if(input.files.length > 0){
        for (let x = 0; x < input.files.length ; x++) {
          if(input.files.item){
            newFiles.push(input.files.item(x)!);
            newImages.push(URL.createObjectURL(input.files.item(x)!))
          }
        }
        this.imagePreviews.set(newImages);
        this.selectedFiles.set(newFiles);
     }
  }

  async addProduct(){
    await this.setProductValue();
    this.productService.addNewProduct(this.product()!).pipe(takeUntil(this.destroy$)).subscribe()
  }

  private async setProductValue() {
    const imageUrls = await this.uploadImagesOfProduct();
    this.product.set({
      name: this.productFormGroup.get('name')!.value!,
      stock: this.productFormGroup.get('stock')!.value!,
      price: this.productFormGroup.get('price')!.value!,
      description: this.productFormGroup.get('description')!.value!,
      brand: this.selectedBrand,
      category: this.selectedCategory,
      rating: 0,
      soldItemsNumber: 0,
      reviews: [],
      id: '',
      imageUrls: imageUrls,
      sellerId: localStorage.getItem('token')!,
    })
    console.log(this.product());
  }

  private async uploadImagesOfProduct() {
    let imageUrls = [];
    for (let index = 0; index < this.selectedFiles().length; index++) {
      const element = this.selectedFiles()[index];
      let res:any = await firstValueFrom(this.imageService.upload(element));
      imageUrls?.push(res.secure_url);
    }
    return imageUrls;
  }

  ngOnDestroy(): void {
    if (this.imagePreviews()) {
       this.imagePreviews().map((i) => {
        URL.revokeObjectURL(i);
       }) 
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
