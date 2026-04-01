import { Component, inject, linkedSignal, signal } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  imports: [FaIconComponent,TranslatePipe],
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
  destroy$ = new Subject<void>()

  menu = linkedSignal(() => {
    return {
      admin: [
        { label: 'SIDEBAR.ADD_NEW_CATEGORY', path: '/new-category' },
        { label: 'SIDEBAR.ADD_NEW_BRAND', path: '/new-brand' },
        { label: 'SIDEBAR.ADD_NEW_USER', path: '/add-new-user' },
        { label: 'SIDEBAR.SUPPORTS', path: '/supports' },
      ],
      seller: [
        { label: 'SIDEBAR.ADD_NEW_PRODUCT', path: '/new-product' },
      ],
    }[this.auth.userRole()!] ?? []
  })


  sidebarOpen = signal(true);
  isLanguageEnglish = signal(this.translateService.getCurrentLang() == 'en')
  isLanguageArabic = signal(this.translateService.getCurrentLang() == 'ar')

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
  changeLanguage(language:string){
    document.getElementsByTagName('html')[0].setAttribute('dir',language == 'en' ? 'ltr' : 'rtl')
    this.translateService.use(language);
    localStorage.setItem('language',language)
    this.isLanguageArabic.update((val) => !val)
    this.isLanguageEnglish.update((val) => !val)
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
    this.auth.logout().pipe(takeUntil(this.destroy$)).subscribe({
      next : () => {
        this.router.navigateByUrl('/login',{replaceUrl : true})
        this.sidebarOpen.set(false);
      },
    })
  }

  goToRoute(path:string){
    this.router.navigate([path])
    this.closeSidebar();
  }

  ngOnDestroy(): void {
    this.sidebarOpen.set(false);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
