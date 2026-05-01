import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemSkeleton } from './order-item-skeleton';

describe('OrderItemSkeleton', () => {
  let component: OrderItemSkeleton;
  let fixture: ComponentFixture<OrderItemSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderItemSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderItemSkeleton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
