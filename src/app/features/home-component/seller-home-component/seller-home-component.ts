import { Component, inject, signal } from '@angular/core';
import { Seller } from '../../auth/user';
import { HomeService } from '../home.service';
import { Observable, tap } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Loader } from "../../../shared/loader/loader";
import { Orders } from "../../orders/orders";
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/interfaces/order';

@Component({
  selector: 'app-seller-home-component',
  imports: [AsyncPipe, CurrencyPipe, Loader, Orders],
  templateUrl: './seller-home-component.html',
  styleUrl: './seller-home-component.scss'
})
export class SellerHomeComponent {
  user!: Observable<Seller>;

  homeSerivce = inject(HomeService);
  orderSerivce = inject(OrderService);

  cancelledOrdersNum = signal<number>(0);
  shippedOrdersNum = signal<number>(0);
  deliveredOrdersNum = signal<number>(0);
  pendingOrdersNum = signal<number>(0);
  sellerOrders! : Observable<Order[]>;

  ngOnInit(): void {
    this.user = this.homeSerivce.getUser().pipe(
      tap((user) => {
        this.pendingOrdersNum.set(0)
          this.shippedOrdersNum.set(0)
          this.cancelledOrdersNum.set(0)
          this.deliveredOrdersNum.set(0)

          user.orders?.forEach(order => {
            switch (order.status) {
              case 'Pending': this.pendingOrdersNum.update(v => v + 1); break;
              case 'Cancelled': this.cancelledOrdersNum.update(v => v + 1); break;
              case 'Delivered': this.deliveredOrdersNum.update(v => v + 1); break;
              case 'Shipped': this.shippedOrdersNum.update(v => v + 1); break;
            }
          });
      }),
    );
    this.sellerOrders = this.orderSerivce.getAllOrders();
  }
}
