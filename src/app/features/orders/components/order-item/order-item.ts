import { Component, computed, inject, model, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../../../shared/services/order.service';
import { Order } from '../../../../core/interfaces/order';
import { normalizeDate } from '../../../../shared/methods';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../../shared/services/toast.service';
import { Loader } from '../../../../shared/components/loader/loader';
import {
  faBox,
  faCalendarAlt,
  faLocationDot,
  faBoxes,
  faDollarSign,
  faClock,
  faCheckCircle,
  faTruck,
  faTimesCircle,
  faArrowRight,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-order-item',
  imports: [CurrencyPipe, RouterLink, TranslateModule, FaIconComponent, DatePipe],
  templateUrl: './order-item.html',
  styleUrl: './order-item.scss'
})
export class OrderItem {
  order = model<Order>();
  orderService = inject(OrderService);
  destory$ = new Subject<void>();
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
      this.orderService
        .changeStatusOrder(this.order()!.id, newStatus).pipe(takeUntil(this.destory$)).subscribe({
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


  // In your component
  orderIcon = faBox;
  calendarIcon = faCalendarAlt;
  locationIcon = faLocationDot;
  itemsIcon = faBoxes;
  priceIcon = faDollarSign;
  truckIcon = faTruck;
  cancelIcon = faTimesCircle;
  deliveredIcon = faCheckCircle;

  // Get arrow direction based on language
  arrowIcon = faArrowRight;

  constructor(private translate: TranslateService) {
    this.arrowIcon = this.translate.currentLang === 'ar' ? faArrowLeft : faArrowRight;
  }

  // Get status icon based on order status
  getStatusIcon(status: string): any {
    switch (status) {
      case 'PENDING':
        return faClock;
      case 'CANCELLED':
        return faTimesCircle;
      case 'SHIPPED':
        return faTruck;
      case 'DELIVERED':
        return faCheckCircle;
      default:
        return faBox;
    }
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
