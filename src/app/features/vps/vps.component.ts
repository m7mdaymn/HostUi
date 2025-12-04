import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // ← Added
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
  private router = inject(Router); // ← Added

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
        this.products = Array.isArray(res) ? res : (res.data || []);
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

  // PERFECT FILTER LOGIC — FIXED 100%
  applyInstantFilter(): void {
    let result: any[] = [...this.products];

    if (this.spaceFilter !== 'all') {
      const sorted = [...this.products].sort((a, b) =>
        this.getStorageGB(a) - this.getStorageGB(b)
      );
      const half = Math.ceil(sorted.length / 2);

      if (this.spaceFilter === 'low') {
        result = sorted.slice(0, half);
      } else if (this.spaceFilter === 'high') {
        result = sorted.slice(-half);
      }
    }

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
      result = result.filter(p => this.getPrice(p) <= this.filters.maxPrice!);
    }

    if (this.filters.planNames.length > 0) {
      result = result.filter(p => {
        const cat = (p.category || p.Category || '').trim();
        return this.filters.planNames.includes(cat);
      });
    }

    this.filtered = result;
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

  // HELPERS
  private getPrice(p: any): number {
    return parseFloat(p.price || p.Price || '99999') || 99999;
  }

  private getStorageGB(p: any): number {
    return parseInt(p.storageGB || p.StorageGB || '0', 10) || 0;
  }

  private getCores(p: any): number {
    return parseInt(p.cores || p.Cores || '1', 10) || 1;
  }

  // Featured Cards
  getCheapestLowSpace(): any {
    return [...this.products]
      .sort((a, b) => this.getStorageGB(a) - this.getStorageGB(b))[0] || null;
  }

  getCheapestHighSpace(): any {
    return [...this.products]
      .sort((a, b) => this.getStorageGB(b) - this.getStorageGB(a))[0] || null;
  }

  getCheapestByCore(): any {
    return this.products
      .map(p => ({ p, ppc: this.getPrice(p) / this.getCores(p) }))
      .sort((a, b) => a.ppc - b.ppc)[0]?.p || null;
  }

  trackByFn = (index: number, item: any) => item?.id || item?.Id || index;

  // UPDATED: Now navigates to checkout page
  orderNow(id: number): void {
    this.router.navigate(['/order-checkout'], {
      queryParams: { id, type: 'vps' }
    });
  }
}
