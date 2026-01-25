import { Component, inject, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from "./shared/navbar/navbar";
import { Footer } from "./shared/footer/footer";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { CartService } from './core/services/cart.service';
import { Subject, Subscription, combineLatest } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { AuthService } from './features/auth/auth.service';
import { Sidebar } from "./shared/sidebar/sidebar";
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, FontAwesomeModule, Sidebar, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  theme:string = 'light';
  themeIcon = faMoon;
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);
  cartProductsSub! : Subscription;
  breakpoints = inject(BreakpointObserver);
  showNavbar = signal(false);
  showSidebar = signal(false);
  sideBarRef = inject(ViewContainerRef);
  sideBar = ViewChild('sideBar',{read: this.sideBarRef});
  private destroy$ = new Subject<void>();


  ngOnInit(): void {
    let isRemembered = localStorage.getItem('isRemembered');
    if(isRemembered == 'true'){
      this.router.navigate(['/']);
    } else{
      this.authService.userRole.next(null);
      this.router.navigate(['/login']);
    }
    this.loadLayout();
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

  private loadLayout() {
    combineLatest([
      this.authService.role$,
      this.breakpoints.observe(['(max-width: 1024px)']).pipe(
        startWith({ matches: window.innerWidth <= 1024 } as BreakpointState) 
      )
    ])
    .pipe(
      takeUntil(this.destroy$),
    )
    .subscribe(([role, screen]) => {
      const isMobile = screen.matches;
      const isBuyerOrGuest = role == 'buyer' || role == null;
      this.showNavbar.set(isMobile || isBuyerOrGuest);
      this.showSidebar.set(!isMobile && !isBuyerOrGuest);
    });
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
