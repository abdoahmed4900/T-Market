import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, ViewContainerRef, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-home-wrapper-component',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss'
})
export class HomeComponent {
  private vcr = inject(ViewContainerRef);
  private platform = inject(PLATFORM_ID);

  async ngOnInit() {
    let role: string | null = null;
    if (isPlatformBrowser(this.platform)) {
      role = localStorage.getItem('role');
    }
    let cmp;
    console.log(role);
    

    if (role === 'buyer') {
      cmp = (await import('./buyer-home-component/home')).BuyerHomeComponent;
    } else if (role === 'seller') {
      cmp = (await import('./seller-home-component/seller-home-component')).SellerHomeComponent;
    } else {
      cmp = (await import('../admin/admin')).Admin;
    }

    this.vcr.createComponent(cmp);
  }
}
