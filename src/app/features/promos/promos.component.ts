import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '../../core/services/translate.service';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { VpsCarouselComponent } from '../../shared/vps-carousel/vps-carousel.component';

interface Promo {
  id?: any;
  title?: string;
  description?: string;
  price?: string | number;
  oldPrice?: string | number;
  features?: string[];
  link?: string;
}

@Component({
  selector: 'app-promos',
  standalone: true,
  imports: [CommonModule, VpsCarouselComponent],
  templateUrl: './promos.component.html',
  styleUrls: ['./promos.component.css']
})
export class PromosComponent implements OnInit {
  promos: Promo[] = [];
  loading = false;
  error: string | null = null;
  whatsappLink = '';

  private translate = inject(TranslateService);
  private http = inject(HttpClient);

  text(key: string): string {
    return this.translate.t(key);
  }

  ngOnInit(): void {
    this.updateWhatsAppLink();
    this.loadPromos();

    this.translate.lang.subscribe(() => {
      this.updateWhatsAppLink();
    });
  }

  private updateWhatsAppLink(): void {
    const msg = this.translate.current === 'ar'
      ? 'مرحباً، أنا مهتم بالعروض والخطط الشهرية'
      : "Hello, I'm interested in your monthly hosting plans and promos!";
    this.whatsappLink = `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }

  loadPromos(): void {
    this.loading = true;
    this.error = null;

    this.http.get(API_ENDPOINTS.PROMOS.LIST).subscribe({
      next: (res: any) => {
        this.promos = Array.isArray(res) ? res : (res?.data || []);
        this.loading = false;
      },
      error: () => {
        this.error = this.text('unableToLoadPromos') || 'Unable to load plans. Please try again later.';
        this.loading = false;
      }
    });
  }

  retryLoadPromos(): void {
    this.loadPromos();
  }

  calculateSavePercent(current: any, old: any): number {
    const c = parseFloat(String(current || 0));
    const o = parseFloat(String(old || 0));
    if (!c || !o || o <= c) return 0;
    return Math.round(((o - c) / o) * 100);
  }

  isHighlighted(index: number): boolean {
    return this.promos.length >= 3 && index === Math.floor(this.promos.length / 2);
  }

  getFeatures(promo: Promo): string[] {
    if (Array.isArray(promo.features)) return promo.features;
    if (promo.description) return [promo.description];
    return [];
  }

  getOrderLink(promo: Promo): string {
    if (promo?.link) return promo.link;

    const title = promo?.title || 'your hosting plan';
    const msg = this.translate.current === 'ar'
      ? `مرحباً، أريد الاشتراك في الباقة: ${title}`
      : `Hi, I'm interested in the plan: ${title}`;

    return `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }

  getHelpWhatsAppLink(): string {
  const message = this.translate.current === 'ar'
    ? 'مرحباً، أحتاج مساعدة في اختيار باقة الاستضافة المناسبة لي'
    : "Hello, I need help choosing the right hosting plan for me";

  return `https://wa.me/+201063194547?text=${encodeURIComponent(message)}`;
}
}
