import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from "./shared/navbar/navbar";
import { Footer } from "./shared/footer/footer";
import { NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { CacheService } from './core/services/cache.service';
import { CartService } from './core/services/cart.service';
import { Subscription } from 'rxjs';
import { AuthService } from './features/auth/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, NgClass,FontAwesomeModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'T-Market';
  isLogin = signal<string>('');
  theme:string = 'light';
  themeIcon = faMoon;
  cacheService = inject(CacheService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);
  cartProductsSub! : Subscription;
  isMobile = computed(() => window.innerWidth < 1024)
  isBuyer = signal<boolean>(false);

  ngOnInit(): void {
    this.isLogin.set(this.cacheService.get('isLogin') ?? 'false');
    let isRemembered = this.cacheService.get('isRemembered') ?? 'false';
    if(this.isLogin() == 'true' && isRemembered == 'true'){
      this.authService.userRole.set(localStorage.getItem('role')!);
      this.router.navigate(['/'], { replaceUrl: true });
      this.isBuyer.set(this.authService.userRole() == 'buyer');
    } else {
      localStorage.removeItem('isLogin');
      localStorage.removeItem('isRemembered');
      this.router.navigate(['/login']);
    }
  }


  constructor(){
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

  public static getFirebaseErrorMessage(code: string): string {
    const messages: Record<string, string> = {
       'auth/invalid-email': 'Invalid email format.',
       'auth/user-disabled': 'This account has been disabled.',
       'auth/user-not-found': 'No user found with this email.',
       'auth/wrong-password': 'Incorrect password.',
       'auth/email-already-in-use': 'This email is already registered.',
       'auth/weak-password': 'Password is too weak.',
       'auth/invalid-credential': 'Invalid or expired login credential.',
       'auth/account-exists-with-different-credential':
       'This email is already linked with another login method.',
       'auth/requires-recent-login': 'Please log in again to continue.',
       'auth/network-request-failed': 'Network error. Check your connection.',
       'auth/too-many-requests': 'Too many attempts. Try again later.',
       'auth/popup-closed-by-user': 'Login popup closed before completion.',
      };
      return messages[code] || 'An unknown error occurred.';
  }

  ngOnDestroy(): void {
    this.cartProductsSub?.unsubscribe();
  }
}
