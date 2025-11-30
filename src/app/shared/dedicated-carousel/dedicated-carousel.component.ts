import { Component, OnInit, OnDestroy } from '@angular/core';
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

  translations: any = {};

  private langSub?: Subscription;

  constructor(
    private dedicatedService: DedicatedService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadDedicatedServers();
    this.subscribeToLanguageChanges();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadDedicatedServers(): void {
    this.dedicatedLoading = true;
    this.dedicatedService.productsList().subscribe({
      next: (res) => {
        this.dedicatedServers = Array.isArray(res) ? res : (res.data || []);
        this.dedicatedLoading = false;
        this.currentSlideIndex = 0; // Reset on load
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
      this.currentSlideIndex = 0; // Prevent visual glitch when switching lang
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
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
  }

  slideRight(): void {
    if (this.currentSlideIndex < this.dedicatedServers.length - 1) {
      this.currentSlideIndex++;
    }
  }

  getCarouselTransform(): string {
    const cardWidth = 360;
    const gap = 30;
    const offset = this.currentSlideIndex * (cardWidth + gap);
    const percent = this.currentSlideIndex * 100;
    return `translateX(calc(-${percent}% - ${offset}px))`;
  }

  isPrevDisabled(): boolean {
    return this.currentSlideIndex === 0;
  }

  isNextDisabled(): boolean {
    return this.currentSlideIndex >= this.dedicatedServers.length - 1;
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
    return server?.link || `https://wa.me/+201063194547?text=${encodeURIComponent('Hi, I am interested in ' + (server?.name || 'Dedicated Server'))}`;
  }
}
