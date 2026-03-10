import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminService } from '../../services/admin.service';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";

@Component({
  selector: 'app-new-category',
  imports: [TranslatePipe, FormsModule, GoBackButton],
  templateUrl: './new-category.html',
  styleUrl: './new-category.scss',
})
export class NewCategory {
  category = signal("");
  adminService = inject(AdminService);
  isAdmin = computed(() => {
    return localStorage.getItem('role') == 'admin'
  });

  async createCategory(){
    if(this.isAdmin() && this.category().length > 3){
      await this.adminService.addNewCategory(this.category())
    }
  }
}
