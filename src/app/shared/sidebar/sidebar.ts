import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../features/auth/auth.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  imports: [FaIconComponent,RouterLink,TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

  auth = inject(AuthService);

  router = inject(Router);
  sub!: Subscription;
  themeIcon = linkedSignal(() => {
    return this.getTheme() == 'light' ? faMoon : faSun;
  });
  translateService = inject(TranslateService);

  menu = computed(() => {
    return {
      admin: [
        { label: 'SIDEBAR.ADD_NEW_USER', path: '/new-user' },
        { label: 'SIDEBAR.VIEW_ALL_USERS', path: '/users' },
        { label: 'SIDEBAR.VIEW_ALL_PRODUCTS', path: '/view-products' },
      ],
      seller: [
        { label: 'SIDEBAR.ADD_NEW_PRODUCT', path: '/new-product' },
        { label: 'SIDEBAR.VIEW_YOUR_PRODUCTS', path: '/view-products' },
      ],
    }[this.auth.userRole.value!] ?? []
  })


  sidebarOpen = signal(false);


  ngOnInit(): void {
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.sidebarOpen.set(false);
    });
  }
  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
  changeLanguage(language:string){
    document.getElementsByTagName('html')[0].setAttribute('dir',language == 'en' ? 'ltr' : 'rtl')
    this.translateService.use(language);
    localStorage.setItem('language',language)
  }


  closeSidebar() {
    this.sidebarOpen.set(false);
  }
  getTheme() {
    return localStorage.getItem('theme') ?? 'light';
  }
  changeTheme() {
    let root = document.documentElement;
    root.classList.toggle('light-theme');
    root.classList.toggle('dark-theme');
    this.themeIcon.set(root.classList.contains('light-theme') ? faMoon : faSun);
    localStorage.setItem('theme',this.getTheme() == 'light' ? 'dark' : 'light');
  }

  logout() {
    let log = this.auth.logout().subscribe({
      next : (value) => {
        localStorage.clear();
        this.router.navigateByUrl('/login',{replaceUrl : true})
        log.unsubscribe();
      },
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
