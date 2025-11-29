import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DedicatedComponent } from './dedicated.component';

describe('DedicatedComponent', () => {
  let component: DedicatedComponent;
  let fixture: ComponentFixture<DedicatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DedicatedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DedicatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
