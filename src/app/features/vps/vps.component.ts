import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../core/constant/apiendpoints';
import { TranslateService } from '../../core/services/translate.service';

interface Filters {
  cores: string[];
  ram: string[];
  storage: string[];
  maxPrice: number | null;
  planNames: string[];
}

@Component({
  selector: 'app-vps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vps.component.html',
  styleUrls: ['../dedicated/dedicated.component.css']
})
export class VpsComponent implements OnInit, OnDestroy {
  products: any[] = [];
  filtered: any[] = [];
  loading = false;
  error: string | null = null;
  filterSidebarOpen = false;
  whatsappLink = '';

  // Space Filter
  spaceFilter: 'all' | 'low' | 'high' = 'all';

  filters: Filters = {
    cores: [],
    ram: [],
    storage: [],
    maxPrice: null,
    planNames: []
  };

  cpuOptions = ['1', '2', '4', '6', '8', '12', '16'];
  ramOptions = ['1', '2', '4', '8', '16', '32', '64'];
  storageOptions = ['ssd', 'nvme', 'hdd'];
  allPlanNames: string[] = [];

  private translate = inject(TranslateService);
  private http = inject(HttpClient);
  private router = inject(Router);

  text(key: string): string {
    return this.translate.t(key);
  }

  ngOnInit(): void {
    this.updateWhatsAppLink();
    this.loadProducts();
    this.translate.lang.subscribe(() => this.updateWhatsAppLink());
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  private updateWhatsAppLink(): void {
    const msg = this.translate.current === 'ar'
      ? 'مرحباً، أنا مهتم بخدمات الاستضافة VPS'
      : "Hello, I'm interested in your VPS hosting services!";
    this.whatsappLink = `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.http.get(API_ENDPOINTS.VPS.PRODUCTS_LIST).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res) ? res : (res.data || []);

        // CRITICAL: Sort by real numeric price + store it safely
        this.products = raw
          .map((p: any) => {
            const priceNum = this.getPrice(p);
            return { ...p, __priceNum: priceNum };
          })
          .sort((a: any, b: any) => a.__priceNum - b.__priceNum); // CHEAPEST FIRST

        this.extractPlanNames();
        this.applyInstantFilter();
        this.loading = false;
      },
      error: () => {
        this.error = this.text('unableToLoadVps') || 'Unable to load VPS plans.';
        this.loading = false;
      }
    });
  }

  private extractPlanNames(): void {
    const names = this.products
      .map(p => (p.category || p.Category || '').trim())
      .filter(Boolean);
    this.allPlanNames = Array.from(new Set(names)).sort();
  }

  setSpaceFilter(filter: 'all' | 'low' | 'high'): void {
    this.spaceFilter = filter;
    this.applyInstantFilter();
  }

  applyInstantFilter(): void {
    let result: any[] = [...this.products];

    // Space filter: use product category only (do NOT use storage or other fields)
    if (this.spaceFilter !== 'all') {
      result = result.filter(p => {
        const cat = (p.category || p.Category || '').toString().toLowerCase().trim();
        if (!cat) return false;
        if (this.spaceFilter === 'low') return this.isLowCategory(cat);
        return this.isHighCategory(cat);
      });
    }

    // Apply all other filters
    if (this.filters.cores.length > 0) {
      result = result.filter(p =>
        this.filters.cores.includes(String(p.cores || p.Cores || '0'))
      );
    }

    if (this.filters.ram.length > 0) {
      result = result.filter(p =>
        this.filters.ram.includes(String(p.ramGB || p.RamGB || '0'))
      );
    }

    if (this.filters.storage.length > 0) {
      result = result.filter(p => {
        const type = (p.storageType || p.StorageType || '').toLowerCase();
        return this.filters.storage.some(t => type.includes(t));
      });
    }

    if (this.filters.maxPrice != null && this.filters.maxPrice > 0) {
      result = result.filter(p => p.__priceNum <= this.filters.maxPrice!);
    }

    if (this.filters.planNames.length > 0) {
      result = result.filter(p => {
        const cat = (p.category || p.Category || '').trim();
        return this.filters.planNames.includes(cat);
      });
    }

    // FINAL: ALWAYS sort by price — guarantees 100% accuracy
    this.filtered = result.sort((a, b) => a.__priceNum - b.__priceNum);
  }

  // FILTER HELPERS
  isPlanNameSelected(name: string): boolean { return this.filters.planNames.includes(name); }
  togglePlanName(name: string): void {
    const i = this.filters.planNames.indexOf(name);
    if (i === -1) this.filters.planNames.push(name);
    else this.filters.planNames.splice(i, 1);
    this.applyInstantFilter();
  }
  clearAllPlanNames(): void { this.filters.planNames = []; this.applyInstantFilter(); }

  isCoreSelected(core: string): boolean { return this.filters.cores.includes(core); }
  toggleCore(core: string): void {
    const i = this.filters.cores.indexOf(core);
    if (i === -1) this.filters.cores.push(core);
    else this.filters.cores.splice(i, 1);
    this.applyInstantFilter();
  }

  isRamSelected(ram: string): boolean { return this.filters.ram.includes(ram); }
  toggleRam(ram: string): void {
    const i = this.filters.ram.indexOf(ram);
    if (i === -1) this.filters.ram.push(ram);
    else this.filters.ram.splice(i, 1);
    this.applyInstantFilter();
  }

  isStorageSelected(type: string): boolean { return this.filters.storage.includes(type); }
  toggleStorage(type: string): void {
    const i = this.filters.storage.indexOf(type);
    if (i === -1) this.filters.storage.push(type);
    else this.filters.storage.splice(i, 1);
    this.applyInstantFilter();
  }

  getActiveFilterCount(): number {
    return this.filters.cores.length +
           this.filters.ram.length +
           this.filters.storage.length +
           this.filters.planNames.length +
           (this.filters.maxPrice ? 1 : 0);
  }

  resetFilters(): void {
    this.filters = { cores: [], ram: [], storage: [], maxPrice: null, planNames: [] };
    this.spaceFilter = 'all';
    this.applyInstantFilter();
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
    document.body.style.overflow = this.filterSidebarOpen ? 'hidden' : '';
  }

  closeFilterSidebar(): void {
    this.filterSidebarOpen = false;
    document.body.style.overflow = '';
  }

  // HELPERS — Super safe price parsing
  private getPrice(p: any): number {
    const priceStr = String(p.price || p.Price || '99999').trim();
    const num = parseFloat(priceStr.replace(/[^0-9.-]/g, '')); // removes $, commas, etc.
    return isNaN(num) ? 99999 : num;
  }

  private getStorageGB(p: any): number {
    return parseInt(p.storageGB || p.StorageGB || '0', 10) || 0;
  }

  private getCores(p: any): number {
    return parseInt(p.cores || p.Cores || '1', 10) || 1;
  }

  // Category-based matchers: determine low/high by category text only
  private isLowCategory(cat: string): boolean {
    const lowKeywords = ['low', 'small', 'mini', 'starter', 'basic', 'economy', 'lite', 'lowspace', 'low-space', 'low space'];
    return lowKeywords.some(k => cat.includes(k));
  }

  private isHighCategory(cat: string): boolean {
    const highKeywords = ['high', 'large', 'pro', 'premium', 'max', 'ultimate', 'plus', 'enterprise', 'highspace', 'high-space', 'high space'];
    return highKeywords.some(k => cat.includes(k));
  }

  // FEATURED CARDS — Now 100% accurate
  getCheapestLowSpace(): any {
    const lowSpace = this.products
      .filter(p => this.isLowCategory((p.category || p.Category || '').toString().toLowerCase()));
    return lowSpace.sort((a, b) => a.__priceNum - b.__priceNum)[0] || null;
  }

  getCheapestHighSpace(): any {
    const highSpace = this.products
      .filter(p => this.isHighCategory((p.category || p.Category || '').toString().toLowerCase()));
    return highSpace.sort((a, b) => a.__priceNum - b.__priceNum)[0] || null;
  }

  getCheapestByCore(): any {
    return this.products
      .map(p => ({ p, ppc: p.__priceNum / this.getCores(p) }))
      .sort((a, b) => a.ppc - b.ppc)[0]?.p || null;
  }

  trackByFn = (index: number, item: any) => item?.id || item?.Id || index;

  orderNow(id: number): void {
    this.router.navigate(['/order-checkout'], {
      queryParams: { id, type: 'vps' }
    });
  }
}
