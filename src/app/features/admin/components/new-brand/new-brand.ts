import { Component, computed, inject, signal } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-brand',
  imports: [TranslatePipe, FaIconComponent,FormsModule],
  templateUrl: './new-brand.html',
  styleUrl: './new-brand.scss',
})
export class NewBrand {
  router = inject(Router);
  brand = signal("");
  adminService = inject(AdminService);
  isAdmin = computed(() => {
    return localStorage.getItem('role') == 'admin'
  });
  isLanguageEnglish = computed(() => {
    return localStorage.getItem('language') == 'en';
  })
  icon = signal(this.isLanguageEnglish() ? faArrowLeft : faArrowRight)
  goBack(){
    this.router.navigate(['/'],{
      replaceUrl: true
    })
  }

  async createBrand(){
    if(this.isAdmin() && this.brand().length > 3){
      await this.adminService.addNewBrand(this.brand())
    }
  }
}
