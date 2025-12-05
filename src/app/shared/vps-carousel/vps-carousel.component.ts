import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { VpsService } from '../../core/services/vps.service';
import { TranslateService } from '../../core/services/translate.service';

interface VPS {
  id?: any;
  Id?: any;
  name?: string;
  description?: string;
  category?: string;
  cores?: number;
  ramGB?: number;
  storageGB?: number;
  storageType?: string;
  bandwidth?: string;
  connectionSpeed?: string;
  price?: string | number;
  oldPrice?: string | number;
  discount?: string;
  link?: string;
  featured?: boolean;
  limited?: boolean;
}

@Component({
  selector: 'app-vps-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vps-carousel.component.html',
  styleUrls: ['./vps-carousel.component.css']
})
export class VpsCarouselComponent implements OnInit, OnDestroy {
  vpsLoading = false;
  vpsError = '';
  vpsServers: VPS[] = [];

  currentSlideIndex = 0;
  cardWidth = 390;
  isRTL = false;
  isMobile = false;
  showPeekAnimation = true;

  private translate = inject(TranslateService);
  private router = inject(Router);
  private langSub!: Subscription;
  private peekInterval: any;

  constructor(private vpsService: VpsService) {}

  text(key: string): string {
    return this.translate.t(key);
  }

  getSaveText(vps: VPS): string {
    const percent = this.calculateSavePercent(vps.price, vps.oldPrice);
    if (percent <= 0) return '';
    return this.text('savePercent').replace('{percent}', percent + '%');
  }

  ngOnInit(): void {
    this.updateCardWidth();
    this.loadVPS();

    this.langSub = this.translate.lang.subscribe((lang) => {
      this.isRTL = lang === 'ar';
      this.currentSlideIndex = 0; // Reset to show cheapest again
    });

    if (this.isMobile) this.startPeekAnimation();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.stopPeekAnimation();
  }

  startPeekAnimation(): void {
    this.peekInterval = setTimeout(() => this.showPeekAnimation = false, 15000);
  }

  stopPeekAnimation(): void {
    clearTimeout(this.peekInterval);
    this.showPeekAnimation = false;
  }

  onUserInteraction(): void {
    this.stopPeekAnimation();
  }

  @HostListener('window:resize')
  updateCardWidth(): void {
    const w = window.innerWidth;
    const wasMobile = this.isMobile;
    this.isMobile = w <= 768;

    if (!wasMobile && this.isMobile && this.vpsServers.length > 0) {
      this.startPeekAnimation();
    }

    this.cardWidth = w <= 768 ? w - 100 : 390;
  }

  // SAFE PRICE PARSING (handles $19.99, 19.99, "19", etc.)
  private getNumericPrice(vps: any): number {
    const priceStr = String(vps.price || vps.Price || '99999').trim();
    const num = parseFloat(priceStr.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 99999 : num;
  }

  loadVPS(): void {
    this.vpsLoading = true;
    this.vpsError = '';
    this.currentSlideIndex = 0;

    this.vpsService.productsList().subscribe({
      next: (res) => {
        console.log('Raw VPS carousel response:', res);

        const rawData = Array.isArray(res) ? res : (res.data || []);

        // CRITICAL: Sort by real price (cheapest first) + store numeric value
        this.vpsServers = rawData
          .map((vps: any) => ({
            ...vps,
            __priceNum: this.getNumericPrice(vps) // safe numeric version
          }))
          .sort((a: any, b: any) => a.__priceNum - b.__priceNum) // CHEAPEST FIRST
          .map((vps: any) => {
            // Remove helper after sorting
            const { __priceNum, ...clean } = vps;
            return clean;
          });

        console.log('VPS Carousel — Cheapest first:', this.vpsServers);

        this.vpsLoading = false;
        this.currentSlideIndex = 0; // Always start with the cheapest
      },
      error: (err) => {
        console.error('VPS carousel loading error:', err);
        this.vpsError = this.text('unableToLoadVps') || 'Unable to load VPS servers.';
        this.vpsLoading = false;
      }
    });
  }

  slideLeft(): void {
    if (this.vpsServers.length === 0) return;
    this.currentSlideIndex = this.currentSlideIndex === 0
      ? this.vpsServers.length - 1
      : this.currentSlideIndex - 1;
  }

  slideRight(): void {
    if (this.vpsServers.length === 0) return;
    this.currentSlideIndex = this.currentSlideIndex >= this.vpsServers.length - 1
      ? 0
      : this.currentSlideIndex + 1;
  }

  getTransformStyle(): string {
    if (this.isMobile) return 'translateX(0)';
    const translateValue = this.currentSlideIndex * this.cardWidth;
    return this.isRTL ? `translateX(${translateValue}px)` : `translateX(-${translateValue}px)`;
  }

  calculateSavePercent(current: any, old: any): number {
    const c = Number(current);
    const o = Number(old);
    if (!c || !o || o <= c) return 0;
    return Math.round(((o - c) / o) * 100);
  }

  orderNow(vps: VPS): void {
    const id = vps.id ?? vps.Id;

    if (!id) {
      const msg = this.isRTL
        ? `مرحباً، أنا مهتم بخطة ${vps.name || 'VPS'}`
        : `Hi, I'm interested in ${vps.name || 'VPS'}`;
      window.open(`https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`, '_blank');
      return;
    }

    this.router.navigate(['/order-checkout'], {
      queryParams: { id, type: 'vps' }
    });
  }
}
