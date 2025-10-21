import { Component, input } from '@angular/core';
import { Product } from '../../features/home/product';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [FaIconComponent, RouterLink,CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  product = input<Product>();

  rating!:number;

  starIcon = faStar;

  root = document.getElementsByTagName('html')[0];

  ngOnInit(){
    this.rating = Math.floor(this.product()!.rating);
  }
}
