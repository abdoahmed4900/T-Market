import { MatDialog } from '@angular/material/dialog';
import { Component, inject, Signal, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../../../shared/services/products.service';
import { Subject, takeUntil } from 'rxjs';
import { DashboardProduct } from "../dashboard-product/dashboard-product";
import { AnimateOnScroll } from "../../../../../shared/animate-on-scroll";
import { PaginationService } from '../../../../../shared/services/pagination.service';
import { PaginationContainer } from "../../../../../shared/components/pagination-container/pagination-container";
import { DeletedProductOverlay } from "../../../../../shared/components/deleted-product-overlay/deleted-product-overlay";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faTrashRestore,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Product } from '../../../../../core/interfaces/product';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-seller-products',
  imports: [TranslateModule, RouterLink, DashboardProduct, AnimateOnScroll, PaginationContainer, DeletedProductOverlay, FaIconComponent],
  providers: [PaginationService],
  templateUrl: './seller-products.html',
  styleUrl: './seller-products.scss',
})
export class SellerProducts {
  productSerivce = inject(ProductsService);
  paginationSerivce = inject(PaginationService);
  showedProducts: Signal<Product[]> = this.paginationSerivce.showedProducts;
  destroy$ = new Subject<void>();
  isLoaded = signal(false);
  matDialog = inject(MatDialog);
  translate = inject(TranslateService);


  // In your component
  editIcon = faEdit;
  deleteIcon = faTrashAlt;
  restoreIcon = faTrashRestore;
  warningIcon = faExclamationTriangle;
  ngOnInit(): void {
    this.getSellerItems();
  }

  private getSellerItems() {
    this.isLoaded.set(false);
    this.productSerivce.getSellerProducts().pipe(
      takeUntil(this.destroy$),
    ).subscribe(
      {
        next: (value) => {
          this.paginationSerivce.reset();
          this.paginationSerivce.productsPerPage.set(3)
          this.paginationSerivce.initializePagination(value);
          this.showedProducts = this.paginationSerivce.showedProducts;
          this.isLoaded.set(true);
        },
      }
    );
  }

  deleteOrUnDeleteProduct(item: Product) {

    let dialogRef = this.matDialog.open(
      ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        title: (item.isDeleted || false) ? this.translate.instant('SIDEBAR.UNDELETE_PRODUCT') : this.translate.instant('SIDEBAR.DELETE_PRODUCT'),
        message: (item.isDeleted || false) ? this.translate.instant('COMMON.UNDELETE') : this.translate.instant('COMMON.DELETE'),
        type: 'danger',
        confirmText: this.translate.instant('COMMON.CONFIRM'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
      }
    },
    )
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.productSerivce.deleteOrUnDeleteProduct(item.id!).pipe(takeUntil(this.destroy$)).subscribe(
          {
            next: (value) => {
              if (value) {
                this.getSellerItems();
              }
            },
          }
        )
      }
    });
  }

  ngOnDestroy(): void {
    this.paginationSerivce.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
