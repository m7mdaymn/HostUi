import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DedicatedCarouselComponent } from './dedicated-carousel.component';

describe('DedicatedCarouselComponent', () => {
  let component: DedicatedCarouselComponent;
  let fixture: ComponentFixture<DedicatedCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DedicatedCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DedicatedCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
