import { Component, ElementRef, inject, linkedSignal, signal, ViewChild } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowAltCircleLeft, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [FaIconComponent, TranslateModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

  auth = inject(AuthService);
  router = inject(Router);
  themeIcon = linkedSignal(() => {
    return this.getTheme() == 'light' ? faMoon : faSun;
  });
  logoutIcon = faArrowAltCircleLeft
  translateService = inject(TranslateService);
  destroy$ = new Subject<void>()
  toastService = inject(ToastService);
  @ViewChild('sidebarContent') sidebarContent!: ElementRef<HTMLElement>;


  menu = linkedSignal<{ label: string, icon: string, path: string }[]>(() => {
    const role = this.auth.userRole();

    if (role === 'admin') {
      return [
        { label: 'SIDEBAR.ADD_NEW_CATEGORY', path: '/new-category', icon: '📂' },
        { label: 'SIDEBAR.ADD_NEW_BRAND', path: '/new-brand', icon: '🔖' },
        { label: 'SIDEBAR.ADD_NEW_USER', path: '/add-new-user', icon: '👤' },
        { label: 'SIDEBAR.SUPPORTS', path: '/supports', icon: '💬' },
      ];
    }

    if (role === 'seller') {
      return [
        { label: 'SIDEBAR.ADD_NEW_PRODUCT', path: '/new-product', icon: '✏️' },
      ];
    }

    return [];
  });

  // Add active route highlighting
  isActiveRoute(path: string): boolean {
    return this.router.url === path;
  }
  sidebarOpen = signal(false);
  isLanguageEnglish = signal(
    (localStorage.getItem('language') ?? 'en') == 'en'
  );

  ngOnInit(): void {
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.changeLanguage(val.lang);
    })
  }

  ngAfterViewInit(): void {
    this.setSideBarDirection();
    this.toggleSidebar();
  }

  private setSideBarDirection() {
    if (this.isLanguageEnglish()) {
      this.sidebarContent.nativeElement.classList.remove('translate-x-[280px]');
      this.sidebarContent.nativeElement.classList.add('translate-x-[-280px]');
    } else {
      this.sidebarContent.nativeElement.classList.remove('translate-x-[-280px]');
      this.sidebarContent.nativeElement.classList.add('translate-x-[280px]');
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
    this.sidebarContent.nativeElement.classList.toggle('open')
  }
  changeLanguage(language: string) {
    if (language != localStorage.getItem('language')) {
      document.getElementsByTagName('html')[0].setAttribute('dir', language == 'en' ? 'ltr' : 'rtl')
      this.translateService.use(language).pipe(takeUntil(this.destroy$)).subscribe();
      localStorage.setItem('language', language)
      this.isLanguageEnglish.set(language == 'en')
      this.setSideBarDirection();
    }
  }
  getTheme() {
    return localStorage.getItem('theme') ?? 'light';
  }
  changeTheme() {
    let root = document.documentElement;
    root.classList.toggle('light-theme');
    root.classList.toggle('dark-theme');
    this.themeIcon.set(root.classList.contains('light-theme') ? faMoon : faSun);
    localStorage.setItem('theme', this.getTheme() == 'light' ? 'dark' : 'light');
  }

  logout() {
    this.auth.logout().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.LOGOUT'));
        this.router.navigateByUrl('/login', { replaceUrl: true })
        this.sidebarOpen.set(false);
      },
      error: () => {
        this.sidebarOpen.set(false);
      }
    })
  }

  goToRoute(path: string) {
    this.router.navigate([path])
    this.sidebarOpen.set(false)
  }

  ngOnDestroy(): void {
    this.sidebarOpen.set(false);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
