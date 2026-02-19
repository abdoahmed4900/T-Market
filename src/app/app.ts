import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { CartService } from './shared/services/cart.service';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { AdminService } from './features/admin/services/admin.service';
import { Navbar } from './core/components/navbar/navbar';
import { Footer } from './core/components/footer/footer';
import { TranslateService } from '@ngx-translate/core';
// import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, FontAwesomeModule, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  theme:string = 'light';
  themeIcon = faMoon;
  cartService = inject(CartService);
  authService = inject(AuthService);
  translateService = inject(TranslateService);
  router = inject(Router);
  cartProductsSub! : Subscription;
  showNavbar = signal(false);
  isAdminHomeOpened = signal(false);
  private destroy$ = new Subject<void>();
  // translateService = inject(TranslateService);
  admin = inject(AdminService);


  async ngOnInit(): Promise<void> {
    this.loadLayout();
    this.getLocale();
    let role = this.authService.userRole();
    if(role){
      this.router.navigate(['/'])
    }else {
      this.router.navigate(['/login'])
    }
  }

  getLocale(){
    let language = this.translateService.getCurrentLang();
    document.getElementsByTagName('html')[0].setAttribute('dir',language == 'en' ? 'ltr' : 'rtl')
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
  @HostListener('window:resize',[])
   loadLayout() {
    let role = localStorage.getItem('role');
    const isMobile = window.innerWidth < 1024;
    const isBuyerOrGuest = role == 'buyer' || role == null
    this.showNavbar.set(isMobile || isBuyerOrGuest);
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
    this.destroy$.next();
    this.destroy$.complete();
  }
}
