import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '../../core/services/translate.service';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { PackagesService } from '../../core/services/packages.service';
import { VpsCarouselComponent } from '../../shared/vps-carousel/vps-carousel.component';

interface Promo { title?: string; discountPercentage?: any; description?: string; features?: string[]; link?: string; }
interface Package { id?: any; name: string; durationMonths: number; totalPrice: number; description?: string; items?: any[]; }

@Component({
  selector: 'app-promos',
  standalone: true,
  imports: [CommonModule, VpsCarouselComponent],
  templateUrl: './promos.component.html',
  styleUrls: ['./promos.component.css']
})
export class PromosComponent implements OnInit {
  promos: Promo[] = [];
  packages: Package[] = [];
  loading = false;
  packagesLoading = false;
  error: string | null = null;
  packagesError: string | null = null;
  whatsappLink = '';

  private translate = inject(TranslateService);
  private http = inject(HttpClient);
  private packagesService = inject(PackagesService);

  text(key: string): string { return this.translate.t(key); }

  ngOnInit(): void {
    this.updateWhatsAppLink();
    this.loadPromos();
    this.loadPackages();

    this.translate.lang.subscribe(() => this.updateWhatsAppLink());
  }

  private updateWhatsAppLink(): void {
    const msg = this.translate.current === 'ar'
      ? 'مرحباً، أنا مهتم بالعروض والخطط الشهرية'
      : "Hello, I'm interested in your monthly hosting plans!";
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
        this.error = this.text('unableToLoadPromos') || 'Unable to load promos.';
        this.loading = false;
      }
    });
  }

  loadPackages(): void {
    this.packagesLoading = true;
    this.packagesError = null;

    this.packagesService.list().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data || res?.packages || []);
        this.packages = data;
        this.packagesLoading = false;
      },
      error: () => {
        this.packagesError = this.text('unableToLoadPackages') || 'Failed to load packages.';
        this.packagesLoading = false;
      }
    });
  }

  retryLoadPromos(): void { this.loadPromos(); }

  isHighlighted(index: number): boolean {
    return this.promos.length >= 3 && index === Math.floor(this.promos.length / 2);
  }

  getFeatures(promo: Promo): string[] {
    return Array.isArray(promo.features) ? promo.features : [];
  }

  getOrderLink(promo: Promo): string {
    if (promo?.link) return promo.link;
    const title = promo?.title || 'plan';
    const msg = this.translate.current === 'ar'
      ? `مرحباً، أريد العرض: ${title}`
      : `Hi, interested in: ${title}`;
    return `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }

  // === PACKAGE HELPERS ===
  getMonthlyPrice(pkg: Package): number {
    return pkg.totalPrice && pkg.durationMonths ? +(pkg.totalPrice / pkg.durationMonths).toFixed(2) : 0;
  }

  calculateSavings(pkg: Package): number {
    const monthly = this.getMonthlyPrice(pkg);
    const oneMonthPkg = this.packages.find(p => p.durationMonths === 1);
    if (!oneMonthPkg || monthly >= oneMonthPkg.totalPrice) return 0;
    return Math.round((1 - monthly / oneMonthPkg.totalPrice) * 100);
  }

  getPackageItems(pkg: Package): any[] {
    return pkg.items || [];
  }

  getPackageOrderLink(pkg: Package): string {
    const msg = this.translate.current === 'ar'
      ? `مرحباً، أريد باقة: ${pkg.name} (${pkg.durationMonths} أشهر - $${pkg.totalPrice} إجمالي)`
      : `Hi, I want the ${pkg.name} package (${pkg.durationMonths} months - $${pkg.totalPrice} total)`;
    return `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }

  getHelpWhatsAppLink(): string {
    const message = this.translate.current === 'ar'
      ? 'مرحباً، أحتاج مساعدة في اختيار الباقة المناسبة'
      : 'Hello, I need help choosing the right plan';
    return `https://wa.me/+201063194547?text=${encodeURIComponent(message)}`;
  }
}
