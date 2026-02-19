import { Component, HostListener, inject, signal } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Observable, Subject, Subscription } from 'rxjs';
import { Order } from '../../core/interfaces/order';
import { AdminService } from './services/admin.service';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Admin } from '../auth/user';
import { Product } from '../../core/interfaces/product';
import { pieChartOptions, statusChartOptions } from '../../core/utils';
import { ChartFactory } from '../../shared/services/chart.factory';
import { TranslatePipe } from '@ngx-translate/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Loader } from '../../shared/components/loader/loader';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { OrderService } from '../../shared/services/order.service';
Chart.register(...registerables);


@Component({
  selector: 'app-admin',
  imports: [Loader, AsyncPipe, CurrencyPipe, TranslatePipe, Sidebar],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent {
  orders!: Observable<Order[]>;
  allProducts!: Observable<Product[]>;
  totalProductsSold!: Observable<Number>
  totalOrdersNumber!: Observable<Number>;
  pendingOrdersNumSub!: Subscription;
  shippedOrdersNumSub!: Subscription;
  deliveredOrdersNumSub!: Subscription;
  cancelledOrdersNumSub!: Subscription;
  pendingOrdersNumber!: Number;
  shippedOrdersNumber!: Number;
  deliveredOrdersNumber!: Number;
  cancelledOrdersNumber!: Number;

  adminService = inject(AdminService);
  breakpoints = inject(BreakpointObserver);
  orderService = inject(OrderService);
  chartFactory = inject(ChartFactory);
  
  admin!: Observable<Admin>;

  chartInstance: Chart | null = null;
  pieChartInstance: Chart | null = null;
  isChartInitialized: boolean = false;
  destroy$ = new Subject<void>();
  showSidebar = signal(true);
  width = signal(window.innerWidth);

  ngOnInit(): void {
    this.setupDashBoard();
  }

  @HostListener('window:resize',[])
  setWidth(){
    this.showSidebar.set(window.innerWidth >= 1024);
  }


  setupDashBoard(){
    this.admin = this.adminService.getAdmin();
    this.orders = this.adminService.getAllOrders();
    this.allProducts = this.adminService.getAllProducts();
    this.totalProductsSold = this.adminService.getNumberOfSoldProducts();
    this.totalOrdersNumber = this.adminService.getOrdersNumber();
    this.getCancelledOrdersNumber();
    this.getPendingOrderNumber();
    this.getShippedOrdersNumber();
    this.getDeliveredOrdersNumber();
  }

  private getCancelledOrdersNumber() {
    this.cancelledOrdersNumSub = this.adminService.getOrdersNumberByStatus('CANCELLED').subscribe(
      {
        next: (value) => {
          this.cancelledOrdersNumber = value;
        },
      }
    );
  }

  private getPendingOrderNumber() {
    this.pendingOrdersNumSub = this.adminService.getOrdersNumberByStatus('PENDING').subscribe(
      {
        next: (value) => {
          this.pendingOrdersNumber = value;
        },
      }
    );
  }

  private getShippedOrdersNumber() {
    this.shippedOrdersNumSub = this.adminService.getOrdersNumberByStatus('SHIPPED').subscribe(
      {
        next: (value) => {
          this.shippedOrdersNumber = value;
        },
      }
    );
  }

  private getDeliveredOrdersNumber() {
    this.deliveredOrdersNumSub = this.adminService.getOrdersNumberByStatus('DELIVERED').subscribe(
      {
        next: (value) => {
          this.deliveredOrdersNumber = value;
        },
      }
    );
  }

  ngAfterViewChecked(){
    if(this.isChartInitialized){
      return;
    }
    this.initializeCharts();
  }
  
  initializeCharts() {
    if (this.pieChartInstance) this.pieChartInstance.destroy();
    if (this.chartInstance) this.chartInstance.destroy();

    const barCanvas = document.getElementById('barChartCanvas') as HTMLCanvasElement;
    const pieCanvas = document.getElementById('pieChartCanvas') as HTMLCanvasElement;

    if(this.isChartInitialized){
      return;
    }

    this.createStatusChart(barCanvas);
    this.createPieInstance(pieCanvas);

    this.isChartInitialized = true;
  }
  private createPieInstance(pieCanvas: HTMLCanvasElement) {
    this.pieChartInstance = this.chartFactory.createChart(pieCanvas, pieChartOptions(this.pendingOrdersNumber,this.shippedOrdersNumber,this.deliveredOrdersNumber,this.cancelledOrdersNumber));
  }
  private createStatusChart(barCanvas: HTMLCanvasElement) {

    this.chartInstance = this.chartFactory.createChart(barCanvas, statusChartOptions(this.pendingOrdersNumber,this.shippedOrdersNumber,this.deliveredOrdersNumber,this.cancelledOrdersNumber));
  }

  ngOnDestroy(): void {
    this.cancelledOrdersNumSub?.unsubscribe();
    this.deliveredOrdersNumSub?.unsubscribe();
    this.pendingOrdersNumSub?.unsubscribe();
    this.shippedOrdersNumSub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
