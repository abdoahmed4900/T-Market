import { Component, input } from '@angular/core';
import { WebsiteTitle } from "../website-title/website-title";
import { CommonModule } from '@angular/common';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-navbar',
  imports: [WebsiteTitle, CommonModule, FaIconComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {

  isLogin= input<boolean>();

  themeIcon : any;

  getTheme(): string {
    return localStorage.getItem('theme') || 'light';
  }

  ngOnInit() {
   window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) { 
      document.querySelector(".navbar-mobile")?.classList.add("navbar-mobile-hidden");
      document.querySelector(".navbar-mobile")?.classList.remove("navbar-mobile-show");
    }
   });
   this.themeIcon = this.getTheme() == 'light' ? faMoon : faSun;
  }

  changeTheme(){
    let root = document.documentElement;
    root.classList.toggle('light-theme');
    root.classList.toggle('dark-theme');
    this.themeIcon = root.classList.contains('light-theme') ? faMoon : faSun;
    localStorage.setItem('theme', root.classList.contains('light-theme') ? 'light' : 'dark');
  }

  toggleNavbar(){
    document.querySelector(".navbar-mobile")?.classList.toggle("navbar-mobile-hidden");
    document.querySelector(".navbar-mobile")?.classList.toggle("navbar-mobile-show");
  }
}
