import { HomeComponent } from "./home-component";
import { ComponentFixture, TestBed } from "@angular/core/testing";

describe('HomeWrapperComponent',() => {

    let component: HomeComponent; 
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers : []
        })
        .compileComponents();
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
})