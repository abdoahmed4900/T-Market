import { Component, HostListener, inject, signal } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { Order } from '../../core/interfaces/order';
import { AdminService } from './services/admin.service';
import { AsyncPipe } from '@angular/common';
import { Admin } from '../auth/user';
import { Product } from '../../core/interfaces/product';
import { pieChartOptions, statusChartOptions } from '../../core/utils';
import { ChartFactory } from '../../shared/services/chart.factory';
import { TranslatePipe } from '@ngx-translate/core';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { ShowUsers } from "./components/show-users/show-users";
import { Orders } from "../orders/orders";
import { StatisticsCard } from "../home-component/seller-home-component/components/statistics-card/statistics-card";
import { DashboardProduct } from "../home-component/seller-home-component/components/dashboard-product/dashboard-product";
import { FormsModule } from '@angular/forms';
import { DashboardProductsSkeleton } from "../home-component/seller-home-component/components/dashboard-products-skeleton/dashboard-products-skeleton";
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
Chart.register(...registerables);


@Component({
  selector: 'app-admin',
  imports: [AsyncPipe, TranslatePipe, Sidebar, ShowUsers, Orders, StatisticsCard, DashboardProduct, FormsModule, DashboardProductsSkeleton, AnimateOnScroll],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent {
  orders!: Observable<Order[]>;
  allProducts!: Observable<Product[]>;
  totalProductsSold!: Observable<Number>
  totalOrdersNumber!: number;
  pendingOrdersNumber!: number;
  shippedOrdersNumber!: number;
  deliveredOrdersNumber!: number;
  cancelledOrdersNumber!: number;
  isPendingOrdersLoaded = signal(false);
  isShippedOrdersLoaded = signal(false);
  isDeliveredOrdersLoaded = signal(false);
  isCancelledOrdersLoaded = signal(false);

  adminService = inject(AdminService);
  chartFactory = inject(ChartFactory);
  
  admin!: Observable<Admin>;

  chartInstance: Chart | null = null;
  pieChartInstance: Chart | null = null;
  isPieChartInitialized = signal(false);
  isStatusChartInitialized = signal(false);
  destroy$ = new Subject<void>();
  isTotalOrdersLoaded = signal(false);
  showSidebar = signal(true);

  ngOnInit(): void {
    this.setupDashBoard();
  }

  @HostListener('window:resize',[])
  setWidth(){
    if(window.innerWidth >= 1024){
      this.showSidebar.set(true)
    }
  }
  setupDashBoard(){
    this.adminService.getAllOrders().pipe(
      takeUntil(this.destroy$),
      tap((value) => {
        this.isTotalOrdersLoaded.set(true);
        this.totalOrdersNumber = value.length;
      })
    ).subscribe()
    this.allProducts = this.adminService.getAllProducts();
    this.totalProductsSold = this.adminService.getNumberOfSoldProducts();
    this.getAllOrders();
  }

  getAllOrders(){
    this.getCancelledOrders();
    this.getDeliveredOrders();
    this.getPendingOrders();
    this.getShippedOrders();
  }

  getCancelledOrders(){
    this.adminService.getOrdersNumberByStatus('CANCELLED').pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next : (value) =>{
          this.isCancelledOrdersLoaded.set(true);
          this.cancelledOrdersNumber = value;
        },
      }
    ) 
  }
  getShippedOrders(){
    this.adminService.getOrdersNumberByStatus('SHIPPED').pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next : (value) =>{
          this.isShippedOrdersLoaded.set(true);
          this.shippedOrdersNumber = value;
        },
      }
    ) 
  }
  getDeliveredOrders(){
    this.adminService.getOrdersNumberByStatus('DELIVERED').pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next : (value) =>{
          this.isDeliveredOrdersLoaded.set(true);
          this.deliveredOrdersNumber = value;
        },
      }
    ) 
  }
  getPendingOrders(){
    this.adminService.getOrdersNumberByStatus('PENDING').pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next : (value) =>{
          this.isPendingOrdersLoaded.set(true);
          this.pendingOrdersNumber = value;
        },
      }
    ) 
  }

  ngAfterViewChecked(){
    if(this.isPieChartInitialized() && this.isStatusChartInitialized()){
      return;
    }
    if(this.isTotalOrdersLoaded()){
      this.initializeCharts();
    }
  }
  
  initializeCharts() {
    if (this.pieChartInstance) this.pieChartInstance.destroy();
    if (this.chartInstance) this.chartInstance.destroy();

    const barCanvas = document.getElementById('barChartCanvas') as HTMLCanvasElement;
    const pieCanvas = document.getElementById('pieChartCanvas') as HTMLCanvasElement;

    if(this.isPieChartInitialized()){
      return;
    }

    this.createStatusChart(barCanvas);
    this.createPieInstance(pieCanvas);
  }
  private createPieInstance(pieCanvas: HTMLCanvasElement) {
    this.pieChartInstance = this.chartFactory.createChart(pieCanvas, pieChartOptions(this.pendingOrdersNumber,this.shippedOrdersNumber,this.deliveredOrdersNumber,this.cancelledOrdersNumber));
    this.isPieChartInitialized.set(true);
  }
  private createStatusChart(barCanvas: HTMLCanvasElement) {
    this.chartInstance = this.chartFactory.createChart(barCanvas, statusChartOptions(this.pendingOrdersNumber,this.shippedOrdersNumber,this.deliveredOrdersNumber,this.cancelledOrdersNumber));
    this.isStatusChartInitialized.set(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
