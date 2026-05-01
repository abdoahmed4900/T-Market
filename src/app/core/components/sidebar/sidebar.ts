import { Component, ElementRef, inject, linkedSignal, signal, ViewChild } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
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
  translateService = inject(TranslateService);
  destroy$ = new Subject<void>()
  toastService = inject(ToastService);
  @ViewChild('sidebarContent') sidebarContent!: ElementRef<HTMLElement>;


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
  isLanguageEnglish = signal(localStorage.getItem('language') == 'en')
  isLanguageArabic = signal(localStorage.getItem('language') == 'ar')



  ngOnInit(): void {
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.isLanguageArabic.set(val.lang == 'ar')
      this.isLanguageEnglish.set(val.lang == 'en')
      if (this.isLanguageArabic()) {
        this.sidebarContent.nativeElement.classList.remove('translate-x-[-280px]')
        this.sidebarContent.nativeElement.classList.add('translate-x-[280px]')
      } else if (this.isLanguageEnglish()) {
        this.sidebarContent.nativeElement.classList.remove('translate-x-[280px]')
        this.sidebarContent.nativeElement.classList.add('translate-x-[-280px]')
      }
    })
  }

  ngAfterViewInit(): void {
    if (this.isLanguageEnglish()) {
      this.sidebarContent.nativeElement.classList.add('translate-x-[-280px]')
    } else if (this.isLanguageArabic()) {
      this.sidebarContent.nativeElement.classList.add('translate-x-[280px]')
    }
    this.sidebarContent.nativeElement.classList.toggle('open')
  }
  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
    this.sidebarContent.nativeElement.classList.toggle('open')
  }
  changeLanguage(language: string) {
    if (language != localStorage.getItem('language')) {
      document.getElementsByTagName('html')[0].setAttribute('dir', language == 'en' ? 'ltr' : 'rtl')
      this.translateService.use(language);
      localStorage.setItem('language', language)
      this.isLanguageArabic.update((val) => !val)
      this.isLanguageEnglish.update((val) => !val)
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
