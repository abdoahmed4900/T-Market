import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { WebsiteTitle } from "../website-title/website-title";
import { CommonModule } from '@angular/common';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AuthService } from '../../features/auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../loader/loader';
import { CacheService } from '../../core/cache.service';
import { CartService } from '../../core/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [WebsiteTitle, CommonModule, FaIconComponent, RouterLinkActive,RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {

  isLogin!: string;

  authService = inject(AuthService);
  cacheService = inject(CacheService);

  router = inject(Router);

  themeIcon : any;

  @ViewChild('box') box!: ElementRef;

  matDialog = inject(MatDialog);

  cartService = inject(CartService);

  totalCartProductsNumber$ = this.cartService.totalCartProductsNumber$;

  cartSubscription!: Subscription;

  isLoggedIn! : Subscription;

  cartNumber = signal<number>(0);
  
  getTheme(): string {
    return this.cacheService.get('theme') ?? 'light';
  }

  ngOnInit() {
   window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) { 
      document.querySelector(".navbar-mobile")?.classList.add("navbar-mobile-hidden");
      document.querySelector(".navbar-mobile")?.classList.remove("navbar-mobile-show");
    }
   });
   this.themeIcon = this.getTheme() == 'light' ? faMoon : faSun;
   this.isLoggedIn = this.authService.isLoggedIn$.subscribe((status) => {
    this.isLogin = status;
   });
   this.cartSubscription = this.cartService.getAllCartProducts().subscribe({

   });
  }

  changeTheme(){
    let root = document.documentElement;
    root.classList.toggle('light-theme');
    root.classList.toggle('dark-theme');
    this.themeIcon = root.classList.contains('light-theme') ? faMoon : faSun;
    this.cacheService.set('theme', root.classList.contains('light-theme') ? 'light' : 'dark');
  }

  toggleNavbar(){
    document.querySelector(".navbar-mobile")?.classList.toggle("navbar-mobile-hidden");
    document.querySelector(".navbar-mobile")?.classList.toggle("navbar-mobile-show");
  }


  logout() {
    let loader = this.matDialog.open(Loader,{
      disableClose: true,
    });
    this.authService.logout().subscribe({
      next: (value) => {
        this.cacheService.remove('user');
        this.cacheService.remove('isLogin');
        this.authService.isLoginSubject.next('false');
        loader.close();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        loader.close();
        // console.log(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.isLoggedIn.unsubscribe();
    this.cartSubscription.unsubscribe();
  }
}
