import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestStoreComponent } from './best-store.component';

describe('BestStoreComponent', () => {
  let component: BestStoreComponent;
  let fixture: ComponentFixture<BestStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BestStoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BestStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
