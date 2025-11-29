import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateService } from '../../core/services/translate.service';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { VpsService } from '../../core/services/vps.service';

interface Promo {
  id?: any;
  title?: string;
  description?: string;
  price?: string | number;
  oldPrice?: string | number;
  features?: string[];
  image?: string;
  link?: string;
}

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
  selector: 'app-promos',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './promos.component.html',
  styleUrls: ['./promos.component.css']
})
export class PromosComponent implements OnInit {
  loading = false;
  error = '';
  promos: Promo[] = [];
  selectedPlan: any = null;

  vpsLoading = false;
  vpsError = '';
  vpsServers: VPS[] = [];

  currentSlideIndex = 0;
  visibleItems = 3;

  private translate = inject(TranslateService);

  constructor(private http: HttpClient, private vpsService: VpsService) {}

  text(key: string): string {
    return this.translate.t(key);
  }

  ngOnInit(): void {
    this.updateVisibleItems();
    this.loadPromos();
    this.loadVPS();
  }

  @HostListener('window:resize')
  updateVisibleItems(): void {
    const w = window.innerWidth;
    this.visibleItems = w <= 768 ? 1 : w <= 1024 ? 2 : 3;
    this.currentSlideIndex = Math.min(this.currentSlideIndex, Math.max(0, this.vpsServers.length - this.visibleItems));
  }

  loadPromos(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(API_ENDPOINTS.PROMOS.LIST).subscribe({
      next: (res) => {
        this.promos = Array.isArray(res) ? res : (res.data || []);
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load plans. Please try again later.';
        this.loading = false;
      }
    });
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
        this.vpsError = 'Unable to load VPS servers.';
        this.vpsLoading = false;
      }
    });
  }

  slideLeft(): void {
    if (this.currentSlideIndex > 0) this.currentSlideIndex--;
  }

  slideRight(): void {
    if (this.currentSlideIndex < this.vpsServers.length - this.visibleItems) this.currentSlideIndex++;
  }

  calculateSavePercent(current: any, old: any): number {
    const c = Number(current);
    const o = Number(old);
    if (!c || !o || o <= c) return 0;
    return Math.round(((o - c) / o) * 100);
  }

  isHighlighted(index: number): boolean {
    return this.promos.length === 3 && index === 1;
  }

  getFeatures(promo: Promo): string[] {
    return Array.isArray(promo.features) ? promo.features : promo.description ? [promo.description] : [];
  }

  getOrderLink(promo: Promo): string {
    if (promo?.link) return promo.link;
    const text = encodeURIComponent(`Hi, I'm interested in ${promo?.title || 'your hosting'}`);
    return `https://wa.me/+201063194547?text=${text}`;
  }

  getVPSOrderLink(vps: VPS): string {
    if (vps?.link) return vps.link;
    const text = encodeURIComponent(`Hi, I'm interested in ${vps?.name || 'VPS'}`);
    return `https://wa.me/+201063194547?text=${text}`;
  }

  retryLoadPromos(): void { this.loadPromos(); }
}
