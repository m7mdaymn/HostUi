import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeginnerGuideComponent } from './beginner-guide.component';

describe('BeginnerGuideComponent', () => {
  let component: BeginnerGuideComponent;
  let fixture: ComponentFixture<BeginnerGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeginnerGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeginnerGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
