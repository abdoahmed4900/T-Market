import { Component, inject } from '@angular/core';
import { HomeService } from '../home-component/home.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-product',
  imports: [],
  templateUrl: './new-product.html',
  styleUrl: './new-product.scss',
})
export class NewProduct {
  homeService = inject(HomeService);
  
  fb = inject(FormBuilder);

  productFormGroup = this.fb.group({
    name: ['',[Validators.minLength(3),Validators.required]],
    category: ['',[Validators.required]],
    price: ['',[Validators.minLength(3),Validators.required]],
  })
}
