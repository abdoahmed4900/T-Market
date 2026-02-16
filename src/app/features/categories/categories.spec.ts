import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Categories } from "./categories";
import { provideRouter } from "@angular/router";
import { ProductsService } from "../../shared/services/products.service";
import { of } from "rxjs";

describe('CategoriesComponent', () => {
    let component: Categories;
    let fixture: ComponentFixture<Categories>;
    let productsServiceMock = {
        getAllProducts: jasmine.createSpy().and.returnValue(of([])),
        readAllCategories: jasmine.createSpy().and.returnValue(of([])),
        filterAllProducts: jasmine.createSpy().and.returnValue(of([])),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            providers: [
                { provide: ProductsService, useValue: productsServiceMock },
                provideRouter([]),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(Categories);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize categories and filteredProducts on ngOnInit', () => {
        fixture.detectChanges();
        expect(productsServiceMock.readAllCategories).toHaveBeenCalled();
        expect(productsServiceMock.getAllProducts).toHaveBeenCalled();
    });

    it('should change minPrice and call filterProducts', () => {
        spyOn(component, 'filterProducts');
        const event = { target: { value: '500' } } as unknown as Event;
        component.changeMinPrice(event);
        expect(component.minPrice).toBe(500);
        expect(component.filterProducts).toHaveBeenCalled();
    });
    
    it('should change maxPrice and call filterProducts', () => {
        spyOn(component, 'filterProducts').and.callThrough();
        const event = { target: { value: '500' } } as unknown as Event;
        component.changeMaxPrice(event);
        component.filterProducts();
        expect(component.maxPrice).toBe(500);
    });

    it('should test go to page functionality', () => {
        expect(component.currentPage()).toBe(1);
        component.goToPage(3);
        fixture.detectChanges();
        expect(component.currentPage()).toBe(3);
    });

    it('should test next page functionality', () => {
        component.goNextPage();
        fixture.detectChanges();
        expect(component.currentPage()).toBe(2);
    });

    it('should test previous page functionality', () => {
        component.goToPage(2);
        component.goPreviousPage();
        fixture.detectChanges();
        expect(component.currentPage()).toBe(1);
    });
});