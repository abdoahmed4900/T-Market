import { Component, computed, inject, signal, input } from '@angular/core';
import { ProductsService } from '../../../../../core/services/products.service';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { numericLengthValidator } from '../../../../../core/utils';
import { TranslatePipe } from '@ngx-translate/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { Product } from '../../../../../core/interfaces/product';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-product',
  imports: [ReactiveFormsModule, TranslatePipe, FaIconComponent,AsyncPipe],
  templateUrl: './update-product.html',
  styleUrl: './update-product.scss',
})
export class UpdateProduct {
  productService = inject(ProductsService);
  isLanguageEnglish = computed(() => {
    return localStorage.getItem('language') == 'en';
  })
  icon = signal(this.isLanguageEnglish() ? faArrowLeft : faArrowRight)
  productId = input<string>('');
  
  fb = inject(FormBuilder);
  router = inject(Router)
  product!: Observable<Product>;

  productFormGroup = this.fb.group({
    name: ['',[Validators.minLength(3),Validators.required]],
    description: ['',[Validators.minLength(50),Validators.required]],
    stock: [,[numericLengthValidator(2),Validators.required]],
    price: [,[numericLengthValidator(2),Validators.required]],
  })


  ngOnInit(): void {
    this.product = this.productService.getProductById(this.productId());
  }

  goBack() {
    this.router.navigate(['/'],{
      replaceUrl: true
    })
  }
}
