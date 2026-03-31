import { Component, effect, ElementRef, inject, linkedSignal, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WebsiteTitle } from '../website-title/website-title';
import { CartService } from '../../../shared/services/cart.service';
import { Loader } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-navbar',
  imports: [WebsiteTitle, CommonModule, FaIconComponent, RouterLinkActive,RouterLink,TranslateModule,TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit{
  authService = inject(AuthService);

  router = inject(Router);

  themeIcon = linkedSignal(() => {
    return this.getTheme() == 'light' ? faMoon : faSun;
  });

  @ViewChild('box') box!: ElementRef;

  matDialog = inject(MatDialog);

  cartService = inject(CartService);

  totalCartProductsNumber$ = this.cartService.totalCartProductsNumber$;

  cartNumber = signal<number>(0);

  translateService = inject(TranslateService);
  destroy$ = new Subject<void>();
  isBuyer = signal(false);
  isLoggedIn = signal(false);

  constructor(){
    effect(() => {
      this.isBuyer = signal(this.authService.userRole() == 'buyer');
      this.isLoggedIn = this.authService.isLoggedIn;
    })
  }

  getTheme(): string {
    return localStorage.getItem('theme') ?? 'light';
  }

  ngOnInit() {
  
   window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) { 
      document.querySelector(".navbar-mobile")?.classList.add("navbar-mobile-hidden");
      document.querySelector(".navbar-mobile")?.classList.remove("navbar-mobile-show");
    }
   });
   this.themeIcon.set(this.getTheme() == 'light' ? faMoon : faSun);
  }

  changeTheme(){
    let root = document.documentElement;
    root.classList.toggle('light-theme');
    root.classList.toggle('dark-theme');
    this.themeIcon.set(root.classList.contains('light-theme') ? faMoon : faSun);
    localStorage.setItem('theme', root.classList.contains('light-theme') ? 'light' : 'dark');
  }
  toggleNavbar(){
    document.querySelector(".navbar-mobile")?.classList.toggle("navbar-mobile-hidden");
    document.querySelector(".navbar-mobile")?.classList.toggle("navbar-mobile-show");
  }

  logout() {
    const loader = this.matDialog.open(Loader, {
      disableClose: true,
    });

    this.authService.logout().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },

      error: () => {
        loader.close();
      },
      complete: () => {
        loader.close();
      }
    });
  }

  goToWishList(){
    this.router.navigateByUrl('/wishlist');
  }

  changeLanguage(language:string){
    document.getElementsByTagName('html')[0].setAttribute('dir',language == 'en' ? 'ltr' : 'rtl')
    this.translateService.use(language);
    localStorage.setItem('language',language)
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
