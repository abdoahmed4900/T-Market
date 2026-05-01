import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../../../../shared/services/products.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ImageService } from '../../../../../shared/services/image.service';
import { GoBackButton } from "../../../../../shared/components/go-back-button/go-back-button";
import { AnimateOnScroll } from "../../../../../shared/animate-on-scroll";
import { numericLengthValidator } from '../../../../../shared/methods';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../../../shared/services/toast.service';
import { Loader } from '../../../../../shared/components/loader/loader';

@Component({
  selector: 'app-update-product',
  imports: [ReactiveFormsModule, TranslateModule, GoBackButton, AnimateOnScroll],
  templateUrl: './update-product.html',
  styleUrl: './update-product.scss',
})
export class UpdateProduct {
  productService = inject(ProductsService);
  productId!: string;

  fb = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute);
  productImagesUrls: string[] = [];
  isLoaded = signal(false);
  imagePreviews = signal<string[]>([]);
  selectedFiles = signal<File[]>([]);

  productFormGroup = this.fb.group({
    name: ['', [Validators.minLength(3), Validators.required]],
    description: ['', [Validators.minLength(50), Validators.required]],
    stock: [0, [numericLengthValidator(2), Validators.required]],
    price: [0, [numericLengthValidator(2), Validators.required]],
  })
  destroy$ = new Subject<void>();
  imageService = inject(ImageService);

  matDialog = inject(MatDialog);

  translateService = inject(TranslateService);
  toastService = inject(ToastService);


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
  async updateProduct() {
    if (this.productFormGroup.invalid) return;

    let imageUrls = await this.uploadImages();
    let loader = this.matDialog.open(Loader, {
      disableClose: true,
    })
    this.productService.updateProduct(
      this.productId,
      {
        name: this.productFormGroup.get('name')!.value!,
        price: this.productFormGroup.get('price')!.value!,
        stock: this.productFormGroup.get('stock')!.value!,
        description: this.productFormGroup.get('description')!.value!,
        imageUrls: imageUrls.length > 0 ? [...this.productImagesUrls, ...imageUrls] : [...this.productImagesUrls],
      }
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.PRODUCT_UPDATED'))
        loader.close()
      },
      error: () => {
        loader.close();
      },
    });

    console.log('updat3d');

  }

  async uploadImages() {
    let imageUrls = [];
    for (let index = 0; index < this.selectedFiles().length; index++) {
      const element = this.selectedFiles()[index];
      let res: any = await firstValueFrom(this.imageService.upload(element));
      imageUrls?.push(res.secure_url);
    }
    return imageUrls;
  }

  addImages($event: Event) {
    let selectedImagesPreviews: string[] = [];
    let selectedImages: File[] = [];
    const files = ($event?.target as HTMLInputElement).files;

    if (!files?.length) return;

    if (files!.length > 0) {
      for (let index = 0; index < files!.length; index++) {
        const element = files?.item(index);
        if (element) {
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
