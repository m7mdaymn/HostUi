import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DedicatedService } from '../../core/services/dedicated.service';
import { TranslateService } from '../../core/services/translate.service';
import { Subscription } from 'rxjs';

interface DedicatedServer {
  id?: any;
  Id?: any;
  name?: string;
  description?: string;
  brand?: string;           // ← Added (Intel/AMD/etc)
  cpuModel?: string;        // ← Added
  cores?: number;           // ← Changed to number
  ramGB?: number;           // ← Changed to number
  storage?: string;         // ← Keep as string (e.g., "2x 1TB NVMe")
  storageGB?: number;       // ← Added
  bandwidth?: string;
  connectionSpeed?: string; // ← Added
  price?: string | number;
  oldPrice?: string | number;
  discount?: string;        // ← Added
  link?: string;
  featured?: boolean;
  limited?: boolean;        // ← Added
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
  isMobile = false;
  cardWidth = 390;

  translations: any = {};
  private langSub?: Subscription;

  private router = inject(Router);

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
    this.isMobile = w <= 768;
    this.cardWidth = w <= 768 ? w - 100 : 390;
  }

  private loadDedicatedServers(): void {
    this.dedicatedLoading = true;
    this.dedicatedError = '';

    this.dedicatedService.productsList().subscribe({
      next: (res) => {
        console.log('🔍 Raw dedicated backend response:', res);

        // Extract array - backend returns res.data or res directly
        const rawData = Array.isArray(res) ? res : (res.data || []);

        console.log('📦 Raw dedicated data array:', rawData);

        // NO MAPPING NEEDED! Backend already uses correct property names
        // Just use the data as-is (matches DedicatedServer interface)
        this.dedicatedServers = rawData;

        console.log('✅ Dedicated servers loaded:', this.dedicatedServers);

        this.dedicatedLoading = false;
        this.currentSlideIndex = 0;
      },
      error: (err) => {
        console.error('❌ Dedicated loading error:', err);
        this.dedicatedError = 'Unable to load Dedicated servers.';
        this.dedicatedLoading = false;
      }
    });
  }

  private subscribeToLanguageChanges(): void {
    this.langSub = this.translateService.lang.subscribe((lang) => {
      this.isRTL = lang === 'ar';
      this.updateTranslations();
      this.currentSlideIndex = 0;
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
      exploreAllDedicated: t('exploreAllDedicated'),
      swipeToExplore: t('swipeToExplore'),
      core: t('core'),
      cores: t('cores')
    };
  }

  slideLeft(): void {
    if (this.dedicatedServers.length === 0) return;
    this.currentSlideIndex = this.currentSlideIndex === 0
      ? this.dedicatedServers.length - 1
      : this.currentSlideIndex - 1;
  }

  slideRight(): void {
    if (this.dedicatedServers.length === 0) return;
    this.currentSlideIndex = this.currentSlideIndex >= this.dedicatedServers.length - 1
      ? 0
      : this.currentSlideIndex + 1;
  }

  getCarouselTransform(): string {
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

  getSaveText(server: DedicatedServer): string {
    if (!server.oldPrice) return '';
    const percent = this.calculateSavePercent(server.price, server.oldPrice);
    return this.translations.savePercent.replace('{percent}', percent.toString());
  }

  orderNow(server: DedicatedServer): void {
    const id = server.id ?? server.Id;

    if (!id) {
      const msg = this.isRTL
        ? `مرحباً، أنا مهتم بـ ${server.name || 'خادم مخصص'}`
        : `Hi, I'm interested in ${server.name || 'Dedicated Server'}`;
      window.open(`https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`, '_blank');
      return;
    }

    this.router.navigate(['/order-checkout'], {
      queryParams: { id, type: 'dedicated' }
    });
  }
}
