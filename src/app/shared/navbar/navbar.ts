import { Component } from '@angular/core';
import { WebsiteTitle } from "../website-title/website-title";

@Component({
  selector: 'app-navbar',
  imports: [WebsiteTitle],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  theme: string = "light";
  changeTheme(){
    const root = document.documentElement;
    root.classList.toggle("light-theme");
    root.classList.toggle("dark-theme");
    if(root.classList.contains("light-theme")){
      this.theme = "light";
    } else {
      this.theme = "dark";
    }
    localStorage.setItem("theme", this.theme);
  }
}
