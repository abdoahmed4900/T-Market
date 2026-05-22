// pagination.service.ts
import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  showedProducts = signal<any[]>([]);
  allPages = signal<number[]>([]);
  showedPages = signal<number[]>([]);
  allProducts = signal<any[]>([]);
  currentPage = signal(1);
  productsPerPage = signal(5);
  isLoaded = signal(false);  // This is the single source of truth

  constructor() {
    this.reset();
  }


  public nextPage() {
    if (this.currentPage() >= this.allPages().length) return;

    this.currentPage.update((v) => v + 1);
    this.updateShowedProducts();

    // Update visible page buttons
    const currentPageValue = this.currentPage();
    const totalPages = this.allPages().length;

    if (currentPageValue > 2 && currentPageValue < totalPages - 1) {
      this.changeShowedPages(currentPageValue - 2, currentPageValue + 1);
    } else if (currentPageValue >= totalPages - 1) {
      this.changeShowedPages(totalPages - 3, totalPages);
    } else if (currentPageValue <= 2) {
      this.changeShowedPages(0, 3);
    }
  }

  public previousPage() {
    if (this.currentPage() <= 1) return;

    this.currentPage.update((v) => v - 1);
    this.updateShowedProducts();

    // Update visible page buttons
    const currentPageValue = this.currentPage();
    const totalPages = this.allPages().length;

    if (currentPageValue > 2 && currentPageValue < totalPages - 1) {
      this.changeShowedPages(currentPageValue - 2, currentPageValue + 1);
    } else if (currentPageValue >= totalPages - 1) {
      this.changeShowedPages(totalPages - 3, totalPages);
    } else if (currentPageValue <= 2) {
      this.changeShowedPages(0, 3);
    }
  }

  private updateShowedProducts() {
    if (!this.allProducts().length) return;

    const start = (this.currentPage() - 1) * this.productsPerPage();
    const end = this.currentPage() * this.productsPerPage();
    this.showedProducts.set(this.allProducts().slice(start, end));
  }

  public changeShowedPages(start: number, end: number) {
    const safeStart = Math.max(0, start);
    const safeEnd = Math.min(this.allPages().length, end);
    this.showedPages.set(this.allPages().slice(safeStart, safeEnd));
  }

  public goToPage(page: number) {
    if (page < 1 || page > this.allPages().length) return;

    this.currentPage.set(page);
    this.updateShowedProducts();
  }
  initializePagination(val: any) {
    this.isLoaded.set(false);  // Set loading to false at the start
    this.allProducts.set(val)
    this.currentPage.set(1);
    this.allPages.set([]);
    this.showedPages.set([]);

    const totalProducts = this.allProducts().length;
    const perPage = this.productsPerPage();

    if (totalProducts === 0) {
      this.showedProducts.set([]);
      this.isLoaded.set(true);  // Set loaded true even for empty
      return;
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / perPage);

    for (let index = 0; index < totalPages; index++) {
      this.allPages.update((pages) => [...pages, index + 1]);
    }

    // Set initial showed products
    const start = 0;
    const end = perPage;
    this.showedProducts.set(this.allProducts().slice(start, end));

    // Set showed pages for pagination buttons
    if (this.allPages().length > 3) {
      this.changeShowedPages(0, 3);
    } else {
      this.changeShowedPages(0, this.allPages().length);
    }

    this.isLoaded.set(true);  // Set loaded to true when done
  }

  reset() {
    this.allPages.set([]);
    this.showedPages.set([]);
    this.allProducts.set([]);
    this.showedProducts.set([]);
    this.currentPage.set(1);
    this.productsPerPage.set(5);
    this.isLoaded.set(false);
  }

  ngOnDestroy() {
    this.reset();
  }
}