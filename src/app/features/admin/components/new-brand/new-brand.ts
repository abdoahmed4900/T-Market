import { Component, computed, inject, signal } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";
import { AnimateOnScroll } from "../../../../shared/animate-on-scroll";

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
  

  async createBrand(){
    if(this.isAdmin() && this.brand().length > 3){
      await this.adminService.addNewBrand(this.brand())
    }
  }
}
