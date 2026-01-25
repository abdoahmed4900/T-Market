import { Component, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../features/auth/auth.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [FaIconComponent,RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

  auth = inject(AuthService);
  sideBarMain = viewChild<HTMLElement>('sideBarMain',{})

  router = inject(Router);
  sub!: Subscription;
  themeIcon = linkedSignal(() => {
    return this.getTheme() == 'light' ? faMoon : faSun;
  });

  menu = computed(() => {
    return {
      admin: [
        { label: 'Add New User', path: '/new-user' },
        { label: 'View All Users', path: '/users' },
        { label: 'View All Products', path: '/view-products' },
      ],
      seller: [
        { label: 'Add New Product', path: '/new-product' },
        { label: 'View Your Products', path: '/view-products' },
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
    let sideBarMain = document.getElementById('sideBarMain')
    console.log(sideBarMain!.classList);
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
