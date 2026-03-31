import { AuthService } from './auth.service';
import { computed, inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  authService = inject(AuthService);
  // isSidebar = linkedSignal(() => this.authService.isSellerOrAdmin());
  isMobile = computed(() => window.innerWidth < 1024);

  changeSideBar(width:number){
    // this.isSidebar.set(width >= 1024)
  }
}
