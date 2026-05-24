import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { OrderItemCard } from "../order-item-card/order-item-card";
import { jsPDF } from 'jspdf';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Order } from '../../../../core/interfaces/order';
import { OrderService } from '../../../../shared/services/order.service';
import { faArrowLeft, faArrowRight, faBox, faCheckCircle, faClock, faDownload, faTimesCircle, faTruck } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AnimateOnScroll } from '../../../../shared/animate-on-scroll';
@Component({
  selector: 'app-order-details',
  imports: [AsyncPipe, OrderItemCard, TranslateModule, FaIconComponent, RouterLink, CurrencyPipe, AnimateOnScroll, DatePipe],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss'
})
export class OrderDetails {
  route = inject(ActivatedRoute);

  order!: Observable<Order>;

  orderService = inject(OrderService);

  id!: string;

  orderIcon = faBox;
  downloadIcon = faDownload;
  arrowBackIcon = faArrowLeft;
  isLoaded = signal(false);

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


  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.order = this.orderService.getOrderById(this.id).pipe(
      tap(() => {
        this.isLoaded.set(true);
      })
    );
  }

  constructor(private translate: TranslateService) {
    this.arrowBackIcon = this.translate.currentLang === 'ar' ? faArrowRight : faArrowLeft;
  }

  async generatePDF(order: Order) {
    const doc = new jsPDF();

    doc.text('T-Market Order Receipt', 10, 10);
    doc.text(`Receipt Date: ${new Date().toLocaleString()}`, 10, 20);
    doc.text('---------------------------', 10, 30);

    doc.text(`Order Date : ${order.orderDate}`, 10, 40)

    doc.text('Items:', 10, 65);
    const items = order.items;

    let y = 75;
    items.forEach(item => {
      doc.text(`${item.name} x${item.quantity} = $${item.price}`, 10, y);
      y += 5;
    });

    doc.text('---------------------------', 10, y + 5);
    doc.text(`Total: ${order.totalPrice}`, 10, y + 20);

    doc.save('order-receipt.pdf');
  }

}
