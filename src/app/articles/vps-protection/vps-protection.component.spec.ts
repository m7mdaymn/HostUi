import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VpsProtectionComponent } from './vps-protection.component';

describe('VpsProtectionComponent', () => {
  let component: VpsProtectionComponent;
  let fixture: ComponentFixture<VpsProtectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VpsProtectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VpsProtectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
