import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../../../../core/interfaces/product';
import { RouterLink } from "@angular/router";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

import {
  faDollarSign,
  faBoxes,
  faCube,
  faArrowRight,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-product',
  imports: [TranslateModule, CurrencyPipe, RouterLink, FaIconComponent],
  templateUrl: './dashboard-product.html',
  styleUrl: './dashboard-product.scss',
})
export class DashboardProduct {
  product = input.required<Product>();

  // In your component
  priceIcon = faDollarSign;
  soldIcon = faBoxes;
  stockIcon = faCube;
  arrowIcon = faArrowRight;

  constructor(private translate: TranslateService) {
    this.arrowIcon = this.translate.currentLang === 'ar' ? faArrowLeft : faArrowRight;
  }

}
