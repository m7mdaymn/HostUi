import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MontageGuideComponent } from './montage-guide.component';

describe('MontageGuideComponent', () => {
  let component: MontageGuideComponent;
  let fixture: ComponentFixture<MontageGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MontageGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MontageGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
