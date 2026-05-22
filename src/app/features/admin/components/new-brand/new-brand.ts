import { Component, computed, inject, signal } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";
import { AnimateOnScroll } from "../../../../shared/animate-on-scroll";
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../../shared/components/loader/loader';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faCheckCircle, faGem, faInfoCircle, faPaperPlane, faTag } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-brand',
  imports: [TranslateModule, FormsModule, GoBackButton, AnimateOnScroll, FaIconComponent],
  templateUrl: './new-brand.html',
  styleUrl: './new-brand.scss',
})
export class NewBrand {
  brand = signal("");
  adminService = inject(AdminService);
  isAdmin = computed(() => {
    return localStorage.getItem('role') == 'admin'
  });
  destroy$ = new Subject<void>();
  translateService = inject(TranslateService);
  toastService = inject(ToastService);
  matDialog = inject(MatDialog);
  brandIcon = faGem;
  tagIcon = faTag;
  infoIcon = faInfoCircle;
  submitIcon = faPaperPlane;
  checkCircleIcon = faCheckCircle;
  router = inject(Router)



  createBrand() {
    let loader = this.matDialog.open(
      Loader,
      {
        disableClose: true,
      }
    )
    if (this.isAdmin() && this.brand().length > 3) {
      this.adminService.addNewBrand(this.brand()).pipe(takeUntil(this.destroy$)).subscribe(
        {
          next: () => {
            loader.close();
            this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.BRAND_CREATED'));
            this.brand.set('');
            this.router.navigateByUrl('/')
          },
          error: () => {
            loader.close();
          },
        }
      )
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
