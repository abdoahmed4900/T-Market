import { Component, computed, inject, signal } from '@angular/core';
import { ProductsService } from '../../../../../shared/services/products.service';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { numericLengthValidator } from '../../../../../core/utils';
import { TranslatePipe } from '@ngx-translate/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { Loader } from "../../../../../shared/components/loader/loader";
import { ImageService } from '../../../../../shared/services/image.service';

@Component({
  selector: 'app-update-product',
  imports: [ReactiveFormsModule, TranslatePipe, FaIconComponent, Loader],
  templateUrl: './update-product.html',
  styleUrl: './update-product.scss',
})
export class UpdateProduct {
  productService = inject(ProductsService);
  isLanguageEnglish = computed(() => {
    return localStorage.getItem('language') == 'en';
  })
  icon = signal(this.isLanguageEnglish() ? faArrowLeft : faArrowRight)
  productId!: string;
  
  fb = inject(FormBuilder);
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute);
  productImagesUrls : string[] = [];
  isLoaded = signal(false);
  imagePreviews= signal<string[]>([]);
  selectedFiles = signal<File[]>([]);

  productFormGroup = this.fb.group({
    name: ['',[Validators.minLength(3),Validators.required]],
    description: ['',[Validators.minLength(50),Validators.required]],
    stock: [0,[numericLengthValidator(2),Validators.required]],
    price: [0,[numericLengthValidator(2),Validators.required]],
  })
  destroy$ = new Subject<void>();
  imageService = inject(ImageService);


  ngOnInit(): void {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.listenToProductChanges();
  }

  private listenToProductChanges() {
     this.productService
    .getProductById(this.productId)
    .pipe(takeUntil(this.destroy$))
    .subscribe(product => {
      this.productFormGroup.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
      });
      this.productImagesUrls = product.imageUrls!;
      this.isLoaded.set(true);
    });
  }

  goBack() {
    this.router.navigate(['/'],{
      replaceUrl: true
    })
  }

  async updateProduct() {
    if (this.productFormGroup.invalid) return;

    let imageUrls = await this.uploadImages();
    await this.productService.updateProduct(
      this.productId,
      {
        name: this.productFormGroup.get('name')!.value!,
        price: this.productFormGroup.get('price')!.value!,
        stock: this.productFormGroup.get('stock')!.value!,
        description: this.productFormGroup.get('description')!.value!,
        imageUrls: imageUrls.length > 0 ? [...this.productImagesUrls,...imageUrls] : [...this.productImagesUrls],
      }
    );

    console.log('updat3d');
    
  }

  async uploadImages(){
     let imageUrls = [];
     for (let index = 0; index < this.selectedFiles().length; index++) {
         const element = this.selectedFiles()[index];
         let res:any = await firstValueFrom(this.imageService.upload(element));
         imageUrls?.push(res.secure_url);
     }
     return imageUrls;
  }

  addImages($event: Event) {
    let selectedImagesPreviews : string[] = [];
    let selectedImages: File[] = [];
    const files = ($event?.target as HTMLInputElement).files;

    if(!files?.length) return;

    if(files!.length > 0){
      for (let index = 0; index < files!.length; index++) {
        const element = files?.item(index);
        if(element){
          selectedImagesPreviews.push(URL.createObjectURL(element!))
          selectedImages.push(element!)
        }
      }
      this.imagePreviews.set(selectedImagesPreviews)
      this.selectedFiles.set(selectedImages);
      console.log(`selected files : ${this.selectedFiles()}`);
      
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.imagePreviews()) {
       this.imagePreviews().map((i) => {
        URL.revokeObjectURL(i);
       }) 
    }
  }
}
