import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SellerHomeComponent } from "./seller-home-component/seller-home-component";
import { AdminComponent } from "../admin/admin";
import { AuthService } from '../../core/services/auth.service';
import { BuyerHomeComponent } from "./buyer-home-component/home";

@Component({
  selector: 'app-home-wrapper-component',
  imports: [CommonModule, SellerHomeComponent, AdminComponent, BuyerHomeComponent],
  standalone: true,
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent {
  authService = inject(AuthService);
  role = this.authService.userRole;
}
