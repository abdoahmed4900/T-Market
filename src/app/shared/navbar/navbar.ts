import { Component, inject } from '@angular/core';
import { WebsiteTitle } from "../website-title/website-title";
import { CommonModule } from '@angular/common';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AuthService } from '../../features/auth/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../loader/loader';
import { CacheService } from '../../core/cache.service';

@Component({
  selector: 'app-navbar',
  imports: [WebsiteTitle, CommonModule, FaIconComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {

  isLogin!: string;

  authService = inject(AuthService);
  cacheService = inject(CacheService);

  router = inject(Router);

  themeIcon : any;

  matDialog = inject(MatDialog)

  getTheme(): string {
    return this.cacheService.get('theme') ?? 'light';
  }

  ngOnInit() {
   window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) { 
      document.querySelector(".navbar-mobile")?.classList.add("navbar-mobile-hidden");
      document.querySelector(".navbar-mobile")?.classList.remove("navbar-mobile-show");
    }
   });
   this.themeIcon = this.getTheme() == 'light' ? faMoon : faSun;
   this.authService.isLoggedIn$.subscribe((status) => {
    this.isLogin = status;
   });
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
        this.cacheService.remove('user');
        this.cacheService.remove('isLogin');
        this.authService.isLoginSubject.next('false');
        loader.close();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        loader.close();
        // console.log(err);
      }
    });
  }
}
