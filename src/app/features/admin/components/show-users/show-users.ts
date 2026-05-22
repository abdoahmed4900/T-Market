import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../../../auth/user';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnimateOnScroll } from "../../../../shared/animate-on-scroll";
import { PaginationService } from '../../../../shared/services/pagination.service';
import { PaginationContainer } from "../../../../shared/components/pagination-container/pagination-container";
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../../shared/services/toast.service';
import { Loader } from '../../../../shared/components/loader/loader';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import {
  faUsers,
  faUser,
  faEnvelope,
  faUserTag,
  faCrown,
  faCheckCircle,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-show-users',
  imports: [TranslateModule, AnimateOnScroll, CommonModule, PaginationContainer, FaIconComponent],
  templateUrl: './show-users.html',
  styleUrl: './show-users.scss',
  providers: [PaginationService]
})
export class ShowUsers {
  adminService = inject(AdminService);

  users!: Observable<User[]>;

  translateService = inject(TranslateService)

  language = signal(this.translateService.currentLang)

  destroy$ = new Subject<void>();

  makeAdminButton = viewChild<HTMLButtonElement>('makeadmin')

  isLoaded = signal(false);

  paginationService = inject(PaginationService);

  matDialog = inject(MatDialog);
  toastService = inject(ToastService);
  usersIcon = faUsers;

  // In your component
  userIcon = faUser;
  emailIcon = faEnvelope;
  roleIcon = faUserTag;
  crownIcon = faCrown;
  adminIcon = faShieldAlt;
  checkIcon = faCheckCircle;
  allUsers = computed(() => {
    return this.paginationService.allProducts();
  })


  showedUsers = signal<User[]>([])
  ngOnInit(): void {
    this.getUsers();
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.language.set(val.lang);
    })
  }

  getUsers() {
    this.adminService.getUsers().pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next: (value) => {
          this.paginationService.reset();
          this.paginationService.productsPerPage.set(3);
          this.paginationService.initializePagination(value);
          this.isLoaded.set(true);
          this.showedUsers = this.paginationService.showedProducts;
        },
      }
    );
  }
  makeUserAdmin(userId: string) {
    let loader = this.matDialog.open(Loader, {
      disableClose: true,
    })
    this.adminService.makeUserAdmin(userId).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          loader.close();
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.ROLE_UPDATED'));
        },
        error: (err) => {
          loader.close();
        },
      }
    );
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.paginationService.reset();
  }
}
