import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { AsyncPipe } from '@angular/common';
import { OrderItemCard } from "../order-item-card/order-item-card";
import { Loader } from "../../../shared/loader/loader";
import { jsPDF } from 'jspdf';
import { Order } from '../../../core/interfaces/order';
@Component({
  selector: 'app-order-details',
  imports: [AsyncPipe, OrderItemCard, Loader],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss'
})
export class OrderDetails {
  route = inject(ActivatedRoute);

  order!: Observable<Order>;

  orderService = inject(OrderService);
  ngOnInit(): void {
    this.route.paramMap.subscribe(
      {
        next : (value) => {
            this.order = this.orderService.getOrderById(value.get('id')!);
        },
      }
    )
  }

  async generatePDF(order : Order) {
    const doc = new jsPDF();

    doc.text('T-Market Order Receipt', 10, 10);
    doc.text(`Receipt Date: ${new Date().toLocaleString()}`, 10, 20);
    doc.text('---------------------------', 10, 30);

    doc.text(`Order Date : ${order.orderDate}`,10,40)

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
