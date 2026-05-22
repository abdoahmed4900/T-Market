import { Component, inject } from '@angular/core';
import { PaginationService } from '../../services/pagination.service';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateOnScroll } from '../../animate-on-scroll';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pagination-container',
  imports: [TranslateModule, AnimateOnScroll, FaIconComponent],
  templateUrl: './pagination-container.html',
  styleUrl: './pagination-container.scss',
})
export class PaginationContainer {
  paginationService = inject(PaginationService);

  allPages = this.paginationService.allPages
  showedPages = this.paginationService.showedPages
  currentPage = this.paginationService.currentPage
  allProducts = this.paginationService.allProducts
  showedProducts = this.paginationService.showedProducts
  chevronLeftIcon = faChevronLeft;
  chevronRightIcon = faChevronRight;

  nextPage() {
    this.paginationService.nextPage();
  }

  previousPage() {
    this.paginationService.previousPage();
  }

  goToPage(page: number) {
    this.paginationService.goToPage(page);
  }
}
