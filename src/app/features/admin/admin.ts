import { Component, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Observable, Subscription } from 'rxjs';
import { Order } from '../../core/interfaces/order';
import { AdminService } from './admin.service';
import { Loader } from "../../shared/loader/loader";
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Admin } from '../auth/user';
import { Product } from '../../core/interfaces/product';
import { pieChartOptions, statusChartOptions } from '../../core/utils';
import { ChartFactory } from '../../core/chart.factory';
Chart.register(...registerables);


@Component({
  selector: 'app-admin',
  imports: [Loader,AsyncPipe,CurrencyPipe],
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
  chartFactory = inject(ChartFactory);
  
  admin!: Observable<Admin>;

  chartInstance: Chart | null = null;
  pieChartInstance: Chart | null = null;
  isChartInitialized: boolean = false;

  ngOnInit(): void {
    this.setupDashBoard();
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
    this.cancelledOrdersNumSub = this.adminService.getOrdersNumberByStatus('Cancelled').subscribe(
      {
        next: (value) => {
          this.cancelledOrdersNumber = value;
        },
      }
    );
  }

  private getPendingOrderNumber() {
    this.pendingOrdersNumSub = this.adminService.getOrdersNumberByStatus('Pending').subscribe(
      {
        next: (value) => {
          this.pendingOrdersNumber = value;
        },
      }
    );
  }

  private getShippedOrdersNumber() {
    this.shippedOrdersNumSub = this.adminService.getOrdersNumberByStatus('Shipped').subscribe(
      {
        next: (value) => {
          this.shippedOrdersNumber = value;
        },
      }
    );
  }

  private getDeliveredOrdersNumber() {
    this.deliveredOrdersNumSub = this.adminService.getOrdersNumberByStatus('Delivered').subscribe(
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
  }
}
