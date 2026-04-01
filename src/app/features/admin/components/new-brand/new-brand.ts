import { Component, computed, inject, signal } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";
import { AnimateOnScroll } from "../../../../shared/animate-on-scroll";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-new-brand',
  imports: [TranslatePipe, FormsModule, GoBackButton, AnimateOnScroll],
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
  

  createBrand(){
    if(this.isAdmin() && this.brand().length > 3){
      this.adminService.addNewBrand(this.brand()).pipe(takeUntil(this.destroy$)).subscribe(
        {
          next : (value) => {
            console.log('brand is created');
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
