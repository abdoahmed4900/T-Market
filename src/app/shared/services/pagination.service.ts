import { signal } from "@angular/core";



export class PaginationService{

    showedProducts = signal<any[]>([]);
    allPages = signal<number[]>([]);
    showedPages = signal<number[]>([]);
    allProducts = signal<any[]>([]);
    currentPage = signal(1);
    productsPerPage = signal(5);

    constructor(){
        this.reset();
    }

    initializePagination(){
        for (let index = 0; index < Math.ceil(this.allProducts().length / this.productsPerPage()); index++) {
            this.allPages.update((pages) => [...pages,index+1])
        }
        this.showedProducts.set(this.allProducts().slice(0,this.productsPerPage()));
        if(this.allPages().length > 3){
            this.changeShowedPages(0,this.currentPage() + 2);          
        }else{
            this.changeShowedPages(0,this.allPages().length);
        }
    }

    public nextPage(){
        this.currentPage.update((v) => v + 1);
        this.showedProducts.set(this.allProducts().slice(
          (this.currentPage() - 1) * this.productsPerPage(),
          this.currentPage() * this.productsPerPage()
        ));
        if((this.currentPage() - 1) % 3 == 0){
            this.changeShowedPages(this.currentPage() - 1,this.currentPage() + 2);
        }
    }
    public previousPage(){
        this.currentPage.update((v) => v - 1);
        this.showedProducts.set(this.allProducts().slice((this.currentPage() - 1) * this.productsPerPage(),(this.currentPage()) * this.productsPerPage()))
        if(this.currentPage() % 3 == 0){
            this.changeShowedPages(this.currentPage() - 3,this.currentPage());
        }
    }

    public changeShowedPages(start:number,end:number){
        this.showedPages.set(this.allPages().slice(start,end)); 
    }

    public goToPage(page:number){
        this.currentPage.set(page);
        this.showedProducts.set(this.allProducts().slice((this.currentPage() - 1) * this.productsPerPage(),this.currentPage() * this.productsPerPage()))
    }

    reset(){
        this.allPages.set([])
        this.showedPages.set([])
        this.allProducts.set([])
        this.showedProducts.set([])
        this.currentPage.set(1)
        this.productsPerPage.set(5);
    }
}