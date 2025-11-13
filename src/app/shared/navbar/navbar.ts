import { Component, computed, ElementRef, inject, linkedSignal, OnInit, signal, ViewChild } from '@angular/core';
import { WebsiteTitle } from "../website-title/website-title";
import { CommonModule } from '@angular/common';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AuthService } from '../../features/auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../loader/loader';
import { CacheService } from '../../core/services/cache.service';
import { CartService } from '../../core/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [WebsiteTitle, CommonModule, FaIconComponent, RouterLinkActive,RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit{
  authService = inject(AuthService);
  cacheService = inject(CacheService);

  router = inject(Router);

  themeIcon : any;

  @ViewChild('box') box!: ElementRef;

  matDialog = inject(MatDialog);

  cartService = inject(CartService);

  totalCartProductsNumber$ = this.cartService.totalCartProductsNumber$;

  cartSubscription!: Subscription;

  isLoggedIn = this.authService.isLoggedIn$;

  cartNumber = signal<number>(0);

  userRole = linkedSignal(() => this.authService.userRole());

  isBuyer = computed(() => this.userRole() == 'buyer')
  isSeller = computed(() => this.userRole() == 'seller')
  isAdmin = computed(() => this.userRole() == 'admin')
  
  getTheme(): string {
    return this.cacheService.get('theme') ?? 'light';
  }

  ngOnInit() {
   console.log(this.isLoggedIn);
   
   window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) { 
      document.querySelector(".navbar-mobile")?.classList.add("navbar-mobile-hidden");
      document.querySelector(".navbar-mobile")?.classList.remove("navbar-mobile-show");
    }
   });
   this.themeIcon = this.getTheme() == 'light' ? faMoon : faSun;
   this.cartSubscription = this.cartService.getAllCartProducts().subscribe({});
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
        this.clearCache();
        loader.close();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        loader.close();
        // console.log(err);
      }
    });
  }


  private clearCache() {
    this.cacheService.remove('isLogin');
    this.cacheService.remove('isRemembered');
    this.cacheService.remove('role');
    this.cacheService.remove('token');
    this.authService.isLoginSubject.next(false);
    this.authService.userRole.set('');
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }
}
