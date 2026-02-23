import { Component, inject, signal } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../../../auth/user';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-show-users',
  imports: [AsyncPipe,TranslatePipe],
  templateUrl: './show-users.html',
  styleUrl: './show-users.scss',
})
export class ShowUsers {
  adminService = inject(AdminService);

  users!: Observable<User[]>;

  translateService = inject(TranslateService)

  language = signal(this.translateService.getCurrentLang())

  destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getUsers();
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.language.set(val.lang);
    })
  }

  getUsers(){
    this.users = this.adminService.getUsers();
  }

  makeUserAdmin(userId:string){
    this.adminService.makeUserAdmin(userId).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next : (value) => {
        },
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
