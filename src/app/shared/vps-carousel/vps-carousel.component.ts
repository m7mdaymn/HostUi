import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { VpsService } from '../../core/services/vps.service';
import { TranslateService } from '../../core/services/translate.service';

interface VPS {
  id?: any;
  name?: string;
  description?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  bandwidth?: string;
  price?: string | number;
  oldPrice?: string | number;
  link?: string;
  featured?: boolean;
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
  visibleItems = 3;

  private translate = inject(TranslateService);
  private langSub!: Subscription;

  constructor(private vpsService: VpsService) {}

  text(key: string): string {
    return this.translate.t(key);
  }

  // Clean dynamic "Save XX%" text
  getSaveText(vps: VPS): string {
    const percent = this.calculateSavePercent(vps.price, vps.oldPrice);
    if (percent <= 0) return '';
    return this.text('savePercent').replace('{percent}', percent + '%');
  }

  ngOnInit(): void {
    this.updateVisibleItems();
    this.loadVPS();

    // Update view when language changes
    this.langSub = this.translate.lang.subscribe(() => {
      this.currentSlideIndex = this.currentSlideIndex; // trigger change detection
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  @HostListener('window:resize')
  updateVisibleItems(): void {
    const w = window.innerWidth;
    this.visibleItems = w <= 768 ? 1 : w <= 1024 ? 2 : 3;
    this.currentSlideIndex = Math.min(this.currentSlideIndex, Math.max(0, this.vpsServers.length - this.visibleItems));
  }

  loadVPS(): void {
    this.vpsLoading = true;
    this.vpsError = '';
    this.currentSlideIndex = 0;

    this.vpsService.productsList().subscribe({
      next: (res) => {
        this.vpsServers = Array.isArray(res) ? res : (res.data || []);
        this.vpsLoading = false;
        this.updateVisibleItems();
      },
      error: () => {
        this.vpsError = this.text('unableToLoadVps') || 'Unable to load VPS servers.';
        this.vpsLoading = false;
      }
    });
  }

  slideLeft(): void {
    if (this.currentSlideIndex > 0) this.currentSlideIndex--;
  }

  slideRight(): void {
    if (this.currentSlideIndex < this.vpsServers.length - this.visibleItems) {
      this.currentSlideIndex++;
    }
  }

  calculateSavePercent(current: any, old: any): number {
    const c = Number(current);
    const o = Number(old);
    if (!c || !o || o <= c) return 0;
    return Math.round(((o - c) / o) * 100);
  }

  getVPSOrderLink(vps: VPS): string {
    if (vps?.link) return vps.link;

    const msg = this.translate.current === 'ar'
      ? `مرحباً، أنا مهتم بخطة ${vps?.name || 'VPS'}`
      : `Hi, I'm interested in ${vps?.name || 'VPS'}`;

    return `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }

  // Optional: add this key if you want error in both languages
  // unableToLoadVps: 'Unable to load VPS servers.' (en) / 'تعذر تحميل خوادم VPS.' (ar)
}
