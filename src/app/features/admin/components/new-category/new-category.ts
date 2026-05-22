import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../services/admin.service';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";
import { AnimateOnScroll } from "../../../../shared/animate-on-scroll";
import { Subject, take } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../../../shared/components/loader/loader';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faFolder, faInfoCircle, faPaperPlane, faCheckCircle, faTags } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-category',
  imports: [TranslateModule, FormsModule, GoBackButton, AnimateOnScroll, FaIconComponent],
  templateUrl: './new-category.html',
  styleUrl: './new-category.scss',
})
export class NewCategory {
  category = signal("");
  adminService = inject(AdminService);
  isAdmin = computed(() => {
    return localStorage.getItem('role') == 'admin'
  });
  destroy$ = new Subject<void>();
  translateService = inject(TranslateService);
  toastService = inject(ToastService);
  matDialog = inject(MatDialog);
  categoryIcon = faTags;
  folderIcon = faFolder;
  infoIcon = faInfoCircle;
  submitIcon = faPaperPlane;
  checkCircleIcon = faCheckCircle;
  router = inject(Router)


  createCategory() {
    let loader = this.matDialog.open(
      Loader,
      {
        disableClose: true,
      }
    )
    if (this.isAdmin() && this.category().length > 3) {
      this.adminService.addNewCategory(this.category()).pipe(take(1)).subscribe({
        next: () => {
          this.category.set("");
          loader.close();
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.CATEGORY_CREATED'));
          this.router.navigateByUrl('/');
        },
        error: () => {
          loader.close();
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
