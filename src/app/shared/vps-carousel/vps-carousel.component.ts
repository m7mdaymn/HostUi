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
  cardWidth = 390; // Card width + gap (360px + 30px gap)
  isRTL = false;
  isMobile = false;
  showPeekAnimation = true;

  private translate = inject(TranslateService);
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
      // Reset to first card when language changes
      this.currentSlideIndex = 0;
    });

    // Start peek animation on mobile
    if (this.isMobile) {
      this.startPeekAnimation();
    }
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.stopPeekAnimation();
  }

  startPeekAnimation(): void {
    // Stop animation after user interacts
    this.peekInterval = setTimeout(() => {
      this.showPeekAnimation = false;
    }, 15000); // Stop after 15 seconds
  }

  stopPeekAnimation(): void {
    if (this.peekInterval) {
      clearTimeout(this.peekInterval);
    }
    this.showPeekAnimation = false;
  }

  onUserInteraction(): void {
    // Stop peek animation when user scrolls
    this.stopPeekAnimation();
  }

  @HostListener('window:resize')
  updateCardWidth(): void {
    const w = window.innerWidth;
    const wasMobile = this.isMobile;
    this.isMobile = w <= 768;

    // Start peek animation when switching to mobile
    if (!wasMobile && this.isMobile && this.vpsServers.length > 0) {
      this.startPeekAnimation();
    }

    if (w <= 768) {
      // Mobile: full width card
      this.cardWidth = w - 100; // Account for padding and arrows
    } else if (w <= 1024) {
      this.cardWidth = 390;
    } else {
      this.cardWidth = 390;
    }
  }

  loadVPS(): void {
    this.vpsLoading = true;
    this.vpsError = '';
    this.currentSlideIndex = 0;

    this.vpsService.productsList().subscribe({
      next: (res) => {
        this.vpsServers = Array.isArray(res) ? res : (res.data || []);
        this.vpsLoading = false;
      },
      error: () => {
        this.vpsError = this.text('unableToLoadVps') || 'Unable to load VPS servers.';
        this.vpsLoading = false;
      }
    });
  }

  slideLeft(): void {
    if (this.vpsServers.length === 0) return;

    // Infinite loop: if at first card, go to last card
    if (this.currentSlideIndex === 0) {
      this.currentSlideIndex = this.vpsServers.length - 1;
    } else {
      this.currentSlideIndex--;
    }
  }

  slideRight(): void {
    if (this.vpsServers.length === 0) return;

    // Infinite loop: if at last card, go to first card
    if (this.currentSlideIndex >= this.vpsServers.length - 1) {
      this.currentSlideIndex = 0;
    } else {
      this.currentSlideIndex++;
    }
  }

  getTransformStyle(): string {
    // On mobile, don't apply transform - let native scrolling handle it
    if (this.isMobile) {
      return 'translateX(0)';
    }

    const translateValue = this.currentSlideIndex * this.cardWidth;

    if (this.isRTL) {
      // For RTL, translate in positive direction
      return `translateX(${translateValue}px)`;
    } else {
      // For LTR, translate in negative direction
      return `translateX(-${translateValue}px)`;
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
}
