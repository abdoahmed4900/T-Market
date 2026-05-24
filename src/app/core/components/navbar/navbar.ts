import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AuthService } from '../../services/auth.service';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { filter, Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WebsiteTitle } from '../website-title/website-title';
import { CartService } from '../../../shared/services/cart.service';
import { Loader } from '../../../shared/components/loader/loader';
import { ToastService } from '../../../shared/services/toast.service';
import {
  faStore,
  faTag,
  faHeadset,
  faHeart,
  faShoppingCart,
  faBox,
  faSun,
  faMoon,
  faSignInAlt,
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  imports: [WebsiteTitle, CommonModule, FaIconComponent, RouterLinkActive, RouterLink, TranslateModule, TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  authService = inject(AuthService);

  router = inject(Router);

  themeIcon = linkedSignal(() => {
    return this.getTheme() == 'light' ? faMoon : faSun;
  });


  // In your component
  categoriesIcon = faStore;
  brandsIcon = faTag;
  supportIcon = faHeadset;
  heartIcon = faHeart;
  cartIcon = faShoppingCart;
  ordersIcon = faBox;
  loginIcon = faSignInAlt;
  logoutIcon = faSignOutAlt;
  menuIcon = faBars;
  closeIcon = faTimes;

  @ViewChild('box') box!: ElementRef;

  matDialog = inject(MatDialog);

  cartService = inject(CartService);
  translate = inject(TranslateService)

  cartNumber = signal(0);

  translateService = inject(TranslateService);
  destroy$ = new Subject<void>();
  isBuyer = signal(false);
  isNotBuyer = signal(false);
  isLoggedIn = signal(false);
  toastService = inject(ToastService);
  isNavBarOpen = signal(false);
  currentUrl = signal(this.router.url);
  isInLoginPage = computed(() => {
    return this.currentUrl() === '/login';
  });

  constructor() {
    effect(() => {
      this.isBuyer = signal(this.authService.userRole() == 'buyer' || this.authService.userRole() == '');
      this.isNotBuyer = signal(this.authService.userRole() == 'seller' || this.authService.userRole() == 'admin');
      this.isLoggedIn = this.authService.isLoggedIn;

    })
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$),
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.url);
      if (this.isNavBarOpen()) {
        this.toggleNavbar();
      }
    });
  }

  getTheme(): string {
    return localStorage.getItem('theme') ?? 'light';
  }

  ngOnInit() {
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        document.querySelector(".navbar-mobile")?.classList.add("navbar-mobile-hidden");
        document.querySelector(".navbar-mobile")?.classList.remove("navbar-mobile-show");
        this.isNavBarOpen.set(false);
      }
    });
    this.themeIcon.set(this.getTheme() == 'light' ? faMoon : faSun);
  }

  changeTheme() {
    let root = document.documentElement;
    root.classList.toggle('light-theme');
    root.classList.toggle('dark-theme');
    this.themeIcon.set(root.classList.contains('light-theme') ? faMoon : faSun);
    localStorage.setItem('theme', root.classList.contains('light-theme') ? 'light' : 'dark');
  }
  toggleNavbar() {
    document.querySelector(".navbar-mobile")?.classList.toggle("navbar-mobile-hidden");
    document.querySelector(".navbar-mobile")?.classList.toggle("navbar-mobile-show");
    this.isNavBarOpen.update((v) => !v)
  }

  logout() {
    const loader = this.matDialog.open(Loader, {
      disableClose: true,
    });

    this.authService.logout().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        loader.close();
        this.cartNumber.set(0);
        this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.LOGOUT'));
        this.router.navigate(['/login']);
      },

      error: (err) => {
        loader.close();
      },
      complete: () => {
        loader.close();
      }
    });
  }

  goToWishList() {
    if (this.isLoggedIn()) {
      this.router.navigateByUrl('/wishlist');
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.WISHLIST') }))
      this.router.navigateByUrl('/login')
    }
  }
  goToSupport() {
    if (this.isLoggedIn()) {
      this.router.navigateByUrl('/support');
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.SUPPORT') }))
      this.router.navigateByUrl('/login')
    }
  }
  goToOrders() {
    if (this.isLoggedIn()) {
      this.router.navigateByUrl('/orders');
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.ORDERS') }))
      this.router.navigateByUrl('/login')
    }
  }
  goToCart() {
    if (this.isLoggedIn()) {
      this.router.navigateByUrl('/cart');
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.CART') }))
      this.router.navigateByUrl('/login')
    }
  }

  changeLanguage(language: string) {
    if (language != localStorage.getItem('language')) {
      document.getElementsByTagName('html')[0].setAttribute('dir', language == 'en' ? 'ltr' : 'rtl')
      this.translateService.use(language).pipe(takeUntil(this.destroy$)).subscribe();
      localStorage.setItem('language', language)
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.isNavBarOpen.set(false);
  }
}
