import { Component, inject, signal, viewChild } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { User } from '../../../auth/user';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-show-users',
  imports: [AsyncPipe, TranslatePipe],
  templateUrl: './show-users.html',
  styleUrl: './show-users.scss',
})
export class ShowUsers {
  adminService = inject(AdminService);

  users!: Observable<User[]>;

  translateService = inject(TranslateService)

  language = signal(this.translateService.getCurrentLang())

  destroy$ = new Subject<void>();

  makeAdminButton = viewChild<HTMLButtonElement>('makeadmin')

  ngOnInit(): void {
    this.getUsers();
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.language.set(val.lang);
    })
  }

  getUsers(){
    this.users = this.adminService.getUsers().pipe(
      tap((user) => {
        console.log(JSON.stringify(user));
        
      })
    )
  }

  buttonclick(){
    console.log('button of makeuseradmin is click');
    
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
