import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./shared/navbar/navbar";
import { Footer } from "./shared/footer/footer";
import { NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, NgClass,FontAwesomeModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'T-Market';
  isLogin : boolean = true;
  theme:string = 'light';
  themeIcon = faMoon;


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
}
