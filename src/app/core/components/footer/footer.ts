import { ToastService } from './../../../shared/services/toast.service';
import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WebsiteTitle } from '../website-title/website-title';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [WebsiteTitle, TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  router = inject(Router);
  toastService = inject(ToastService)
  translateService = inject(TranslateService)

  goToSupport() {
    if (localStorage.getItem('token')) {
      this.router.navigateByUrl('/support')
    } else {
      this.toastService.error(this.translateService.instant('ERROR_MESSAGES.LOGIN', { page: this.translateService.instant('NAVBAR.SUPPORT') }))
      this.router.navigateByUrl('/login')
    }
  }
}
