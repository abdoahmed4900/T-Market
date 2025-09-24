import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteTitle } from './website-title';

describe('WebsiteTitle', () => {
  let component: WebsiteTitle;
  let fixture: ComponentFixture<WebsiteTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteTitle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebsiteTitle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
