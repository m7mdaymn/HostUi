import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cta-section.component.html',
  styleUrls: ['./cta-section.component.css']
})
export class CtaSectionComponent implements OnInit, OnDestroy {
  isRTL = false;
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private langSub!: Subscription;

  // Use getter so payment methods are always translated dynamically
  get paymentMethods() {
    const t = this.translate.t.bind(this.translate);
    return [
      {
        name: t('instapay'),
        icon: 'assets/img/footer/insta.png',
        instant: false,
        description: t('instapayDesc')
      },
      {
        name: t('vodafoneCash'),
        icon: 'assets/img/footer/vodcash.jpg',
        instant: false,
        description: t('vodafoneCashDesc')
      },
      {
        name: t('binance'),
        icon: 'assets/img/footer/biance.png',
        description: t('binanceDesc'),
        instant: true
      }
    ];
  }

  ngOnInit(): void {
    this.langSub = this.translate.lang.subscribe((lang) => {
      this.isRTL = lang === 'ar';
      this.cdr.detectChanges(); // Force update if needed
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  text(key: string): string {
    return this.translate.t(key);
  }

  getWhatsAppLink(): string {
    const msg = this.isRTL
      ? 'مرحباً، أريد البدء في استخدام خدماتكم'
      : 'Hi, I want to get started with your services';
    return `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }
}
