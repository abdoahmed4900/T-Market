import { Component, inject } from '@angular/core';
import { PaginationService } from '../../services/pagination.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination-container',
  imports: [TranslatePipe],
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

  nextPage(){
    this.paginationService.nextPage();
  }

  previousPage(){
    this.paginationService.previousPage();
  }

  goToPage(page:number){
    this.paginationService.goToPage(page);
  }
}
