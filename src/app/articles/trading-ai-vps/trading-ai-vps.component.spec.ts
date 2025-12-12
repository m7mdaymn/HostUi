import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingAiVpsComponent } from './trading-ai-vps.component';

describe('TradingAiVpsComponent', () => {
  let component: TradingAiVpsComponent;
  let fixture: ComponentFixture<TradingAiVpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingAiVpsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradingAiVpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
