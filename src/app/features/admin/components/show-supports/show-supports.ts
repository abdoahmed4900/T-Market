import { PaginationService } from './../../../../shared/services/pagination.service';
import { Component, inject, Signal, signal } from '@angular/core';
import { PaginationContainer } from "../../../../shared/components/pagination-container/pagination-container";
import { SupportService } from '../../../support/services/support.service';
import { Subject, takeUntil } from 'rxjs';
import { Support } from '../../../support/interfaces/support';
import { AnimateOnScroll } from '../../../../shared/animate-on-scroll';
import { TranslatePipe } from '@ngx-translate/core';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";

@Component({
  selector: 'app-show-supports',
  imports: [PaginationContainer, AnimateOnScroll, TranslatePipe, GoBackButton],
  providers: [PaginationService],
  templateUrl: './show-supports.html',
  styleUrl: './show-supports.scss',
})
export class ShowSupports {
  isLoaded = signal(false);

  paginationService = inject(PaginationService);
  supportService = inject(SupportService);

  showedSupports : Signal<Support[]> = this.paginationService.showedProducts;

  destroy$ = new Subject<void>();

  allSupports = signal<Support[]>([])

  ngOnInit(): void {
    this.supportService.readAllSupports().pipe(takeUntil(this.destroy$)).subscribe(
      {
        next : (value) =>{
          this.isLoaded.set(false);
          this.paginationService.reset();
          this.paginationService.productsPerPage.set(9);
          this.allSupports.set(value);
          this.paginationService.allProducts.set(value);
          this.paginationService.initializePagination();
          this.isLoaded.set(true);
        },
      }
    )
  }
}
