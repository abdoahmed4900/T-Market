import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminService } from '../../services/admin.service';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-new-category',
  imports: [TranslatePipe, FormsModule, FaIconComponent,],
  templateUrl: './new-category.html',
  styleUrl: './new-category.scss',
})
export class NewCategory {
  router = inject(Router);
  category = signal("");
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

  async createCategory(){
    if(this.isAdmin()){
      await this.adminService.addNewCategory(this.category())
    }
  }
}
