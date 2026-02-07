import { Component, ElementRef, inject, linkedSignal, OnInit, signal, ViewChild } from '@angular/core';
import { WebsiteTitle } from "../website-title/website-title";
import { CommonModule } from '@angular/common';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AuthService } from '../../features/auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../loader/loader';
import { CartService } from '../../core/services/cart.service';
import { combineLatest, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  imports: [WebsiteTitle, CommonModule, FaIconComponent, RouterLinkActive,RouterLink,TranslateModule],
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

  cartSubscription!: Subscription;

  isLoggedIn = this.authService.isLoggedIn$;
  role = this.authService.userRole;

  cartNumber = signal<number>(0);

  // translateService = inject(TranslateService);

  menu! : Record<string,string>;

  menuDecider = combineLatest(
    [
      this.authService.role$
    ]
  ).subscribe(
    ([role]) => {
      if(role == 'buyer'){
        this.isBuyer.set(true);
      }
    }
  )

  isBuyer = linkedSignal(() => this.role.value  == 'buyer');

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
   this.cartSubscription = this.cartService.getAllCartProducts().subscribe({});
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

    this.authService.logout().subscribe({
      next: () => {
        this.clearCache(); 
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


  private clearCache() {
    localStorage.clear();
    this.authService.isLoginSubject.next(false);
    this.authService.userRole.next(null);
  }

  goToWishList(){
    this.router.navigateByUrl('/wishlist');
  }

  changeLanguage(language:string){
    // this.translateService.use(language);
    localStorage.setItem('language',language)
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.menuDecider.unsubscribe();
  }
}
