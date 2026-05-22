import { ToastService } from './../../../shared/services/toast.service';
import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WebsiteTitle } from '../website-title/website-title';
import { Router } from '@angular/router';
import {
  faStore,
  faTag,
  faHeadset,
  faHeart,
  faBox,
  faEnvelope,
  faPaperPlane,
  faShieldAlt,
  faTruck,
  faLink,
  faGlobe,
  faInfoCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-footer',
  imports: [WebsiteTitle, TranslateModule, FaIconComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  router = inject(Router);
  toastService = inject(ToastService)
  translateService = inject(TranslateService)


  // In your component
  logoIcon = faStore;
  categoriesIcon = faStore;
  brandsIcon = faTag;
  supportIcon = faHeadset;
  heartIcon = faHeart;
  ordersIcon = faBox;
  emailIcon = faEnvelope;
  sendIcon = faPaperPlane;
  shieldIcon = faShieldAlt;
  truckIcon = faTruck;
  linkIcon = faLink;
  newsletterIcon = faEnvelope;

  // Social icons (using solid alternatives)
  facebookIcon = faGlobe;      // Alternative for Facebook
  twitterIcon = faInfoCircle;  // Alternative for Twitter
  instagramIcon = faGlobe;     // Alternative for Instagram
  linkedinIcon = faLink;       // Alternative for LinkedIn
  clockIcon = faClock;

  currentYear = new Date().getFullYear();

  goToSupport() {
    if (localStorage.getItem('token')) {
      this.router.navigateByUrl('/support')
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.SUPPORT') }))
      this.router.navigateByUrl('/login')
    }
  }
  goToWishList() {
    if (localStorage.getItem('token')) {
      this.router.navigateByUrl('/wishlist')
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.WISHLIST') }))
      this.router.navigateByUrl('/login')
    }
  }
  goToOrders() {
    if (localStorage.getItem('token')) {
      this.router.navigateByUrl('/orders')
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.ORDERS') }))
      this.router.navigateByUrl('/login')
    }
  }
}
