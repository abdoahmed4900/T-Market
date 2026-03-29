import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Product } from '../../../../../core/interfaces/product';

@Component({
  selector: 'app-dashboard-product',
  imports: [TranslatePipe,CurrencyPipe],
  templateUrl: './dashboard-product.html',
  styleUrl: './dashboard-product.scss',
})
export class DashboardProduct {
  product = input.required<Product>();
}
