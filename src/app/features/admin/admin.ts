import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { Order } from '../../core/interfaces/order';
import { AdminService } from './services/admin.service';
import { Admin } from '../auth/user';
import { Product } from '../../core/interfaces/product';
import { ChartFactory } from '../../shared/services/chart.factory';
import { TranslateModule } from '@ngx-translate/core';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { ShowUsers } from "./components/show-users/show-users";
import { Orders } from "../orders/orders";
import { StatisticsCard } from "../home-component/seller-home-component/components/statistics-card/statistics-card";
import { FormsModule } from '@angular/forms';
import { AnimateOnScroll } from "../../shared/animate-on-scroll";
import { AllProducts } from "./components/all-products/all-products";
import { pieChartOptions, statusChartOptions } from '../../shared/utils';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import {
  faChartSimple,
  faBox,
  faChartBar,
  faChartPie,
  faShoppingCart,
  faInbox,
  faDashboard,
} from '@fortawesome/free-solid-svg-icons';

Chart.register(...registerables);


@Component({
  selector: 'app-admin',
  imports: [TranslateModule, Sidebar, ShowUsers, Orders, StatisticsCard, FormsModule, AnimateOnScroll, AllProducts, FaIconComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent {
  orders!: Observable<Order[]>;
  allProducts!: Observable<Product[]>;
  totalOrdersNumber = signal(0);
  pendingOrdersNumber = signal(0);
  shippedOrdersNumber = signal(0);
  deliveredOrdersNumber = signal(0);
  cancelledOrdersNumber = signal(0);
  isPendingOrdersLoaded = signal(false);
  isShippedOrdersLoaded = signal(false);
  isDeliveredOrdersLoaded = signal(false);
  isCancelledOrdersLoaded = signal(false);
  adminService = inject(AdminService);
  chartFactory = inject(ChartFactory);
  dashboardIcon = faDashboard;
  statsIcon = faChartSimple;
  productsIcon = faBox;
  chartIcon = faChartBar;
  barChartIcon = faChartBar;
  pieChartIcon = faChartPie;
  ordersIcon = faShoppingCart;
  emptyOrdersIcon = faInbox;

  admin!: Observable<Admin>;

  chartInstance: Chart | null = null;
  pieChartInstance: Chart | null = null;
  isPieChartInitialized = signal(false);
  isStatusChartInitialized = signal(false);
  destroy$ = new Subject<void>();
  isTotalOrdersLoaded = signal(false);
  showSidebar = signal(true);

  constructor() {
    // Effect to update charts when order numbers change
    effect(() => {
      const pending = this.pendingOrdersNumber();
      const shipped = this.shippedOrdersNumber();
      const delivered = this.deliveredOrdersNumber();
      const cancelled = this.cancelledOrdersNumber();

      // Update charts when numbers change and charts are initialized
      if (this.isStatusChartInitialized() && this.chartInstance) {
        this.updateChartData(pending, shipped, delivered, cancelled);
      }

      if (this.isPieChartInitialized() && this.pieChartInstance) {
        this.updatePieChartData(pending, shipped, delivered, cancelled);
      }
    });
  }

  private updateChartData(pending: number, shipped: number, delivered: number, cancelled: number) {
    if (!this.chartInstance) return;

    // Update the chart data
    this.chartInstance.data.datasets[0].data = [pending, shipped, delivered, cancelled];
    this.chartInstance.update(); // This re-renders the chart
  }

  private updatePieChartData(pending: number, shipped: number, delivered: number, cancelled: number) {
    if (!this.pieChartInstance) return;

    // Update the pie chart data
    this.pieChartInstance.data.datasets[0].data = [pending, shipped, delivered, cancelled];
    this.pieChartInstance.update(); // This re-renders the chart
  }


  ngOnInit(): void {
    this.setupDashBoard();
  }

  @HostListener('window:resize', [])
  setWidth() {
    if (window.innerWidth >= 1024) {
      this.showSidebar.set(true)
    }
  }
  setupDashBoard() {
    this.adminService.getAllOrders().pipe(
      takeUntil(this.destroy$),
      tap((value) => {
        this.isTotalOrdersLoaded.set(true);
        this.totalOrdersNumber.set(value.length);
        this.getAllOrders();
      })
    ).subscribe()
  }

  getAllOrders() {
    this.getCancelledOrders();
    this.getDeliveredOrders();
    this.getPendingOrders();
    this.getShippedOrders();
  }

  getCancelledOrders() {
    this.adminService.getOrdersNumberByStatus('CANCELLED').pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next: (value) => {
          this.isCancelledOrdersLoaded.set(true);
          this.cancelledOrdersNumber.set(value);
        },
      }
    )
  }
  getShippedOrders() {
    this.adminService.getOrdersNumberByStatus('SHIPPED').pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next: (value) => {
          this.isShippedOrdersLoaded.set(true);
          this.shippedOrdersNumber.set(value)
        },
      }
    )
  }
  getDeliveredOrders() {
    this.adminService.getOrdersNumberByStatus('DELIVERED').pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next: (value) => {
          this.isDeliveredOrdersLoaded.set(true);
          this.deliveredOrdersNumber.set(value);
        },
      }
    )
  }
  getPendingOrders() {
    this.adminService.getOrdersNumberByStatus('PENDING').pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      {
        next: (value) => {
          this.isPendingOrdersLoaded.set(true);
          this.pendingOrdersNumber.set(value);
        },
      }
    )
  }

  ngAfterViewChecked() {
    if (this.isPieChartInitialized() && this.isStatusChartInitialized()) {
      return;
    }
    if (this.isTotalOrdersLoaded()) {
      this.initializeCharts();
    }
  }

  initializeCharts() {
    if (this.pieChartInstance) this.pieChartInstance.destroy();
    if (this.chartInstance) this.chartInstance.destroy();

    const barCanvas = document.getElementById('barChartCanvas') as HTMLCanvasElement;
    const pieCanvas = document.getElementById('pieChartCanvas') as HTMLCanvasElement;

    this.createStatusChart(barCanvas);
    this.createPieInstance(pieCanvas);
  }
  private createPieInstance(pieCanvas: HTMLCanvasElement) {

    if (this.isPieChartInitialized()) {
      return;
    }
    this.pieChartInstance = this.chartFactory.createChart(pieCanvas, pieChartOptions(this.pendingOrdersNumber, this.shippedOrdersNumber, this.deliveredOrdersNumber, this.cancelledOrdersNumber));
    this.isPieChartInitialized.set(true);
  }
  private createStatusChart(barCanvas: HTMLCanvasElement) {

    if (this.isStatusChartInitialized()) {
      return;
    }
    this.chartInstance = this.chartFactory.createChart(barCanvas, statusChartOptions(this.pendingOrdersNumber, this.shippedOrdersNumber, this.deliveredOrdersNumber, this.cancelledOrdersNumber));
    this.isStatusChartInitialized.set(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
