import { Injectable } from "@angular/core";
import { Product } from "./product";

@Injectable(
    {providedIn : 'root'}
)
export class PaginationService{

    showedProducts! : Product[];
    allPages!:number[];
    showedPages!: number[];
    allProducts!:Product[];
    currentPage!:number;
    productsPerPage = 1;

    initializePagination(){
        this.allPages = [];
        this.currentPage = 1;
        for (let index = 1; index < (this.allProducts.length / this.productsPerPage) + ((this.allProducts.length % this.productsPerPage + this.productsPerPage) / this.productsPerPage); index++) {
            this.allPages.push(index)
        }
        this.showedProducts = this.allProducts.slice(0,this.productsPerPage);
        if(this.allPages.length > 3){
            this.changeShowedPages(0,this.currentPage + 2);
            console.log(this.showedPages);
            console.log(this.allPages);            
        }else{
            this.changeShowedPages(0,this.allPages.length);
        }
    }
    public nextPage(){
        this.currentPage++;
        this.showedProducts = this.allProducts.slice(
          (this.currentPage - 1) * this.productsPerPage,
          this.currentPage * this.productsPerPage
        );
        if((this.currentPage - 1) % 3 == 0){
            this.changeShowedPages(this.currentPage - 1,this.currentPage + 2);
        }
        console.log(this.showedPages);
    }
    public previousPage(){
        this.showedProducts = this.allProducts.slice((this.currentPage - 2) * this.productsPerPage,(--this.currentPage) * this.productsPerPage);
        if(this.currentPage % 3 == 0){
            this.changeShowedPages(this.currentPage - 3,this.currentPage);
        }
    }

    public changeShowedPages(start:number,end:number){
        console.log(start + ' ' + end);
        this.showedPages = this.allPages.slice(start,end)
    }

    public goToPage(page:number){
        this.currentPage = page;
        this.showedProducts = this.allProducts.slice((this.currentPage - 1) * this.productsPerPage,this.currentPage * this.productsPerPage)
    }
}