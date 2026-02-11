import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBrand } from './new-brand';

describe('NewBrand', () => {
  let component: NewBrand;
  let fixture: ComponentFixture<NewBrand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewBrand]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBrand);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
