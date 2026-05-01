import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { CartService } from './shared/services/cart.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { AdminService } from './features/admin/services/admin.service';
import { Navbar } from './core/components/navbar/navbar';
import { Footer } from './core/components/footer/footer';
import { TranslateService } from '@ngx-translate/core';

import { ProductsService } from './shared/services/products.service';
import { TitleService } from './shared/services/title.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, FontAwesomeModule, Navbar,],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  theme: string = 'light';
  themeIcon = faMoon;
  cartService = inject(CartService);
  authService = inject(AuthService);
  translateService = inject(TranslateService);
  private destroy$ = new Subject<void>();
  admin = inject(AdminService);
  productService = inject(ProductsService);
  titleService = inject(TitleService);


  ngOnInit() {
    this.getLocale();
    let isLoggedIn = this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.cartService.getAllCartProducts().pipe(takeUntil(this.destroy$)).subscribe()
    }
    this.productService.readAllCategories().pipe(takeUntil(this.destroy$)).subscribe();
    this.productService.readAllBrands().pipe(takeUntil(this.destroy$)).subscribe();
  }

  getLocale() {
    let language = localStorage.getItem('language') ?? 'en';
    document.getElementsByTagName('html')[0].setAttribute('dir', language == 'en' ? 'ltr' : 'rtl')
  }


  constructor() {
    this.getTheme();
  }

  private getTheme() {
    this.theme = localStorage.getItem('theme') ?? 'light';
    let root = document.documentElement;
    if (this.theme) {
      if (this.theme == 'light') {
        root.classList.add('light-theme');
        this.themeIcon = faMoon;
      } else {
        root.classList.add('dark-theme');
        this.themeIcon = faSun;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
