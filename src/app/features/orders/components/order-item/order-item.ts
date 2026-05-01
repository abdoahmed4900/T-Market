import { Component, computed, inject, model, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../../../shared/services/order.service';
import { Order } from '../../../../core/interfaces/order';
import { normalizeDate } from '../../../../shared/methods';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../../shared/services/toast.service';
import { Loader } from '../../../../shared/components/loader/loader';

@Component({
  selector: 'app-order-item',
  imports: [CurrencyPipe, RouterLink, TranslateModule],
  templateUrl: './order-item.html',
  styleUrl: './order-item.scss'
})
export class OrderItem {
  order = model<Order>();
  orderService = inject(OrderService);
  ordersSub!: Subscription;
  role = signal<string>(localStorage.getItem('role') || '');
  isAdmin = computed(() => this.role() == 'admin');
  translateService = inject(TranslateService)

  matDialog = inject(MatDialog);
  toastService = inject(ToastService);
  modifyOrderDate() {
    return normalizeDate(new Date(this.order()?.orderDate!));
  }

  changeOrderStatus(newStatus: "PENDING" | "SHIPPED" | "CANCELLED" | "DELIVERED") {
    let loader = this.matDialog.open(Loader, {
      disableClose: true
    })
    if (this.role() === 'admin') {
      this.ordersSub = this.orderService
        .changeStatusOrder(this.order()!.id, newStatus).subscribe({
          next: () => {
            loader.close();
            if (newStatus == 'CANCELLED') {
              this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.ORDER_CANCELLED'));
            }
            else if (newStatus == 'DELIVERED') {
              this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.ORDER_DELIVERED'));
            }
            else if (newStatus == 'SHIPPED') {
              this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.ORDER_SHIPPED'));
            }
          },
          error: () => {
            loader.close();
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.ordersSub?.unsubscribe();
  }
}
