import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DedicatedService } from '../../core/services/dedicated.service';
import { TranslateService } from '../../core/services/translate.service';
import { Subscription } from 'rxjs';

interface DedicatedServer {
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
  ipAddresses?: string;
  location?: string;
}

@Component({
  selector: 'app-dedicated-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dedicated-carousel.component.html',
  styleUrls: ['./dedicated-carousel.component.css']
})
export class DedicatedCarouselComponent implements OnInit, OnDestroy {
  dedicatedLoading = true;
  dedicatedError = '';
  dedicatedServers: DedicatedServer[] = [];
  currentSlideIndex = 0;
  isRTL = false;
  cardWidth = 390; // 360px card + 30px gap

  translations: any = {};

  private langSub?: Subscription;

  constructor(
    private dedicatedService: DedicatedService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.updateCardWidth();
    this.loadDedicatedServers();
    this.subscribeToLanguageChanges();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  @HostListener('window:resize')
  updateCardWidth(): void {
    const w = window.innerWidth;
    if (w <= 768) {
      this.cardWidth = w - 100; // Account for padding and arrows on mobile
    } else if (w <= 1024) {
      this.cardWidth = 390;
    } else {
      this.cardWidth = 390;
    }
  }

  private loadDedicatedServers(): void {
    this.dedicatedLoading = true;
    this.dedicatedService.productsList().subscribe({
      next: (res) => {
        this.dedicatedServers = Array.isArray(res) ? res : (res.data || []);
        this.dedicatedLoading = false;
        this.currentSlideIndex = 0;
      },
      error: () => {
        this.dedicatedError = 'Unable to load Dedicated servers.';
        this.dedicatedLoading = false;
      }
    });
  }

  private subscribeToLanguageChanges(): void {
    this.langSub = this.translateService.lang.subscribe((lang) => {
      this.isRTL = lang === 'ar';
      this.updateTranslations();
      this.currentSlideIndex = 0; // Reset to first card when language changes
    });
    this.updateTranslations();
  }

  private updateTranslations(): void {
    const t = (key: string) => this.translateService.t(key);

    this.translations = {
      enterpriseSolutions: t('enterpriseSolutions'),
      premiumDedicatedServers: t('premiumDedicatedServers'),
      dedicatedDesc: t('dedicatedDesc'),
      loadingDedicated: t('loadingDedicated'),
      premiumChoice: t('premiumChoice'),
      startingAt: t('startingAt'),
      savePercent: t('savePercent'),
      processor: t('processor'),
      ramLabel: t('ramLabel'),
      storageLabel: t('storageLabel'),
      bandwidthLabel: t('bandwidthLabel'),
      ipAddresses: t('ipAddresses'),
      locationLabel: t('locationLabel'),
      fullRootAccess: t('fullRootAccess'),
      support247: t('support247'),
      ddosProtection: t('ddosProtection'),
      configureServer: t('configureServer'),
      uptimeGuarantee: t('uptimeGuarantee'),
      exploreAllDedicated: t('exploreAllDedicated')
    };
  }

  slideLeft(): void {
    if (this.dedicatedServers.length === 0) return;

    // Infinite loop: if at first card, go to last card
    if (this.currentSlideIndex === 0) {
      this.currentSlideIndex = this.dedicatedServers.length - 1;
    } else {
      this.currentSlideIndex--;
    }
  }

  slideRight(): void {
    if (this.dedicatedServers.length === 0) return;

    // Infinite loop: if at last card, go to first card
    if (this.currentSlideIndex >= this.dedicatedServers.length - 1) {
      this.currentSlideIndex = 0;
    } else {
      this.currentSlideIndex++;
    }
  }

  getCarouselTransform(): string {
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

  getSaveText(server: DedicatedServer): string {
    if (!server.oldPrice) return '';
    const percent = this.calculateSavePercent(server.price, server.oldPrice);
    return this.translations.savePercent.replace('{percent}', percent.toString());
  }

  getDedicatedOrderLink(server: DedicatedServer): string {
    if (server?.link) return server.link;

    const msg = this.isRTL
      ? `مرحباً، أنا مهتم بـ ${server?.name || 'Dedicated Server'}`
      : `Hi, I am interested in ${server?.name || 'Dedicated Server'}`;

    return `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }
}
