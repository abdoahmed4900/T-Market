import { Component, inject, signal, viewChild } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../../../auth/user';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AnimateOnScroll } from "../../../../shared/animate-on-scroll";
import { PaginationService } from '../../../../shared/services/pagination.service';
import { PaginationContainer } from "../../../../shared/components/pagination-container/pagination-container";

@Component({
  selector: 'app-show-users',
  imports: [TranslatePipe, AnimateOnScroll, CommonModule, PaginationContainer],
  templateUrl: './show-users.html',
  styleUrl: './show-users.scss',
  providers: [PaginationService]
})
export class ShowUsers {
  adminService = inject(AdminService);

  users!: Observable<User[]>;

  translateService = inject(TranslateService)

  language = signal(this.translateService.getCurrentLang())

  destroy$ = new Subject<void>();

  makeAdminButton = viewChild<HTMLButtonElement>('makeadmin')

  isLoaded = signal(false);

  paginationService = inject(PaginationService);
  
  showedUsers = signal<User[]>([])
  ngOnInit(): void {
    this.getUsers();
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.language.set(val.lang);
    })
  }

  getUsers(){
    this.adminService.getUsers().pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next: (value) =>{
          this.paginationService.reset();
          this.paginationService.productsPerPage.set(3);
          this.paginationService.allProducts.set(value);
          this.paginationService.initializePagination();
          this.isLoaded.set(true);
          this.showedUsers = this.paginationService.showedProducts;
        },
      }
    );
  }
  makeUserAdmin(userId:string){
    console.log('🚨 makeUserAdmin CALLED with userId:', userId, 'Time:', new Date().toISOString());
    
    this.adminService.makeUserAdmin(userId).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next : (value) => {
          console.log('value is succcsss');
          
        },
        error : (err) =>{
          console.log(err);
          console.log('error in errv ufnc');
          
        },
      }
    );
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
