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
  brands: string[];
  maxPrice: number | null;
}

@Component({
  selector: 'app-dedicated',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dedicated.component.html',
  styleUrls: ['./dedicated.component.css']
})
export class DedicatedComponent implements OnInit, OnDestroy {
  products: any[] = [];
  filtered: any[] = [];
  topThree: any[] = [];
  loading = false;
  error: string | null = null;
  filterSidebarOpen = false;
  whatsappLink = '';
  processorFilter: 'all' | 'amd' | 'intel' = 'all';

  filters: Filters = { cores: [], ram: [], brands: [], maxPrice: null };
  cpuOptions = ['2', '4', '6', '8', '12', '16', '24', '32'];
  ramOptions = ['16', '32', '64', '128', '256', '512'];
  brandOptions: string[] = [];

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
      ? 'مرحباً، أريد استضافة خادم مخصص'
      : "Hello, I'm interested in Dedicated Servers!";
    this.whatsappLink = `https://wa.me/+201063194547?text=${encodeURIComponent(msg)}`;
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.http.get(API_ENDPOINTS.DEDICATED.PRODUCTS_LIST).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res) ? res : (res.data || []);

        // FINAL: Sort once by real numeric price and store it
        this.products = raw
          .map((p: any) => {
            const priceNum = this.getPrice(p);
            return { ...p, __priceNum: priceNum };
          })
          .sort((a: any, b: any) => a.__priceNum - b.__priceNum); // Cheapest first

        // Extract brands
        this.brandOptions = Array.from(new Set(this.products
          .map(p => (p.brand || p.Brand || p.cpuModel || '').trim())
          .filter(Boolean)))
          .sort();

        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = this.text('unableToLoadDedicated') || 'Unable to load dedicated servers.';
        this.loading = false;
      }
    });
  }

  setProcessorFilter(type: 'all' | 'amd' | 'intel'): void {
    this.processorFilter = type;
    this.applyFilters();
  }

  toggleCore(core: string): void {
    const idx = this.filters.cores.indexOf(core);
    if (idx === -1) this.filters.cores.push(core);
    else this.filters.cores.splice(idx, 1);
    this.applyFilters();
  }

  toggleRam(ram: string): void {
    const idx = this.filters.ram.indexOf(ram);
    if (idx === -1) this.filters.ram.push(ram);
    else this.filters.ram.splice(idx, 1);
    this.applyFilters();
  }

  toggleBrand(brand: string): void {
    const idx = this.filters.brands.indexOf(brand);
    if (idx === -1) this.filters.brands.push(brand);
    else this.filters.brands.splice(idx, 1);
    this.applyFilters();
  }

  public applyFilters(): void {
    let result = [...this.products];

    // Processor Filter (Intel/AMD/All)
    if (this.processorFilter !== 'all') {
      result = result.filter(p =>
        this.processorFilter === 'amd' ? this.isAmd(p) : this.isIntel(p)
      );
    }

    // Cores
    if (this.filters.cores.length) {
      result = result.filter(p =>
        this.filters.cores.includes(String(p.cores || p.Cores || ''))
      );
    }

    // RAM
    if (this.filters.ram.length) {
      result = result.filter(p =>
        this.filters.ram.includes(String(p.ramGB || p.RamGB || ''))
      );
    }

    // Brand
    if (this.filters.brands.length) {
      result = result.filter(p => {
        const b = (p.brand || p.Brand || p.cpuModel || '').trim();
        return this.filters.brands.includes(b);
      });
    }

    // Max Price
    if (this.filters.maxPrice != null && this.filters.maxPrice > 0) {
      result = result.filter(p => p.__priceNum <= this.filters.maxPrice!);
    }

    // FINAL: Always sort by price — 100% accurate cheapest first
    this.filtered = result.sort((a, b) => a.__priceNum - b.__priceNum);

    // Update Top 3
    this.topThree = this.getTopThreeDedicated();
  }

  getActiveFilterCount(): number {
    const sidebar = this.filters.cores.length + this.filters.ram.length +
                    this.filters.brands.length + (this.filters.maxPrice ? 1 : 0);
    const processor = this.processorFilter !== 'all' ? 1 : 0;
    return sidebar + processor;
  }

  resetFilters(): void {
    this.filters = { cores: [], ram: [], brands: [], maxPrice: null };
    this.processorFilter = 'all';
    this.applyFilters();
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
    document.body.style.overflow = this.filterSidebarOpen ? 'hidden' : '';
  }

  closeFilterSidebar(): void {
    this.filterSidebarOpen = false;
    document.body.style.overflow = '';
  }

  // SAFE PRICE PARSING
  private getPrice(p: any): number {
    const priceStr = String(p.price || p.Price || '99999').trim();
    const num = parseFloat(priceStr.replace(/[^0-9.-]/g, '')); // removes $, commas
    return isNaN(num) ? 99999 : num;
  }

  private isIntel(p: any): boolean {
    const n = `${p.brand || p.cpuModel || ''}`.toLowerCase();
    return n.includes('intel') || n.includes('xeon') || /e[3-7]/.test(n);
  }

  private isAmd(p: any): boolean {
    const n = `${p.brand || p.cpuModel || ''}`.toLowerCase();
    return n.includes('amd') || n.includes('epyc') || n.includes('ryzen');
  }

  private getCheapestIntel(): any {
    return this.products
      .filter(p => this.isIntel(p))
      .sort((a, b) => a.__priceNum - b.__priceNum)[0] || null;
  }

  private getCheapestAmd(): any {
    return this.products
      .filter(p => this.isAmd(p))
      .sort((a, b) => a.__priceNum - b.__priceNum)[0] || null;
  }

  private getBestValuePerCore(): any {
    const valid = this.products
      .filter(p => {
        const cores = parseInt(p.cores || p.Cores || '0') || 0;
        return cores > 0 && p.__priceNum < 99999;
      });

    if (valid.length === 0) return null;

    return valid
      .map(p => ({
        server: p,
        ppc: p.__priceNum / (parseInt(p.cores || p.Cores || '1') || 1)
      }))
      .sort((a, b) => a.ppc - b.ppc)[0].server;
  }

  getTopThreeDedicated(): any[] {
    const result: { server: any; type: 'intel' | 'amd' | 'value' | 'fallback' }[] = [];
    const seen = new Set<number | string>();

    const addIfNotSeen = (server: any, type: any) => {
      if (server && !seen.has(server.id || server.Id)) {
        seen.add(server.id || server.Id);
        result.push({ server, type });
      }
    };

    addIfNotSeen(this.getCheapestIntel(), 'intel');
    addIfNotSeen(this.getCheapestAmd(), 'amd');
    addIfNotSeen(this.getBestValuePerCore(), 'value');

    // Fill remaining with cheapest not yet shown
    const remaining = this.products
      .filter(p => !seen.has(p.id || p.Id))
      .sort((a, b) => a.__priceNum - b.__priceNum);

    while (result.length < 3 && remaining.length > 0) {
      const next = remaining.shift()!;
      addIfNotSeen(next, 'fallback');
    }

    return result.slice(0, 3);
  }

  getSubtitleForType(type: string): string {
    const map: Record<string, string> = {
      intel: this.text('bestPriceIntel'),
      amd: this.text('bestPriceAmd'),
      value: this.text('lowestPricePerCore'),
      fallback: this.text('highPerformanceDeal')
    };
    return map[type] || this.text('highPerformanceDeal');
  }

  trackByFn = (index: number, item: any) => item?.id || item?.Id || index;
  trackByTopThree = (index: number, item: any) => item?.server?.id || index;

  orderNow(id: number): void {
    this.router.navigate(['/order-checkout'], {
      queryParams: { id, type: 'dedicated' }
    });
  }
}
