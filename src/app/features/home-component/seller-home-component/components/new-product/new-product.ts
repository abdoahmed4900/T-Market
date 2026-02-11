import { TranslatePipe } from '@ngx-translate/core';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../../../core/services/products.service';
import { HomeService } from '../../../home.service';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { numericLengthValidator } from '../../../../../core/utils';
import { Observable, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-new-product',
  imports: [TranslatePipe, FaIconComponent, ReactiveFormsModule,AsyncPipe,MatSelectModule],
  templateUrl: './new-product.html',
  styleUrl: './new-product.scss',
})
export class NewProduct {
  homeService = inject(HomeService);
  productService = inject(ProductsService);
  isLanguageEnglish = computed(() => {
    return localStorage.getItem('language') == 'en';
  })
  icon = signal(this.isLanguageEnglish() ? faArrowLeft : faArrowRight)
  
  fb = inject(FormBuilder);
  router = inject(Router)
  categories!: Observable<string[]>;
  brands!: Observable<string[]>;
  selectedCategory! : string;
  selectedBrand! : string;

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
      tap((val) => {
        this.selectedBrand = val[0];
      })
    );
  }

  goBack() {
    this.router.navigate(['/'],{
      replaceUrl: true
    })
  }
}
