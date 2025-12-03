import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
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
  topThree: any[] = [];           // New: Dedicated array for top 3
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
        this.products = Array.isArray(res) ? res : (res.data || []);
        this.brandOptions = Array.from(new Set(this.products
          .map(p => (p.brand || p.Brand || p.cpuModel || '').trim())
          .filter(Boolean)));

        this.applyFilters(); // This will set both filtered & topThree
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
    idx === -1 ? this.filters.cores.push(core) : this.filters.cores.splice(idx, 1);
    this.applyFilters();
  }

  toggleRam(ram: string): void {
    const idx = this.filters.ram.indexOf(ram);
    idx === -1 ? this.filters.ram.push(ram) : this.filters.ram.splice(idx, 1);
    this.applyFilters();
  }

  toggleBrand(brand: string): void {
    const idx = this.filters.brands.indexOf(brand);
    idx === -1 ? this.filters.brands.push(brand) : this.filters.brands.splice(idx, 1);
    this.applyFilters();
  }

  public applyFilters(): void {
    let result = [...this.products];

    if (this.processorFilter !== 'all') {
      result = result.filter(p =>
        this.processorFilter === 'amd' ? this.isAmd(p) : this.isIntel(p)
      );
    }

    if (this.filters.cores.length) {
      result = result.filter(p => this.filters.cores.includes(String(p.cores || p.Cores || '')));
    }
    if (this.filters.ram.length) {
      result = result.filter(p => this.filters.ram.includes(String(p.ramGB || p.RamGB || '')));
    }
    if (this.filters.brands.length) {
      result = result.filter(p => {
        const b = (p.brand || p.Brand || p.cpuModel || '').trim();
        return this.filters.brands.includes(b);
      });
    }
    if (this.filters.maxPrice != null && this.filters.maxPrice > 0) {
      result = result.filter(p => this.getPrice(p) <= this.filters.maxPrice!);
    }

    this.filtered = result;
    this.topThree = this.getTopThreeDedicated(); // Critical: Update top 3
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
    this.filtered = [...this.products];
    this.topThree = this.getTopThreeDedicated();
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
    document.body.style.overflow = this.filterSidebarOpen ? 'hidden' : '';
  }

  closeFilterSidebar(): void {
    this.filterSidebarOpen = false;
    document.body.style.overflow = '';
  }

  private getPrice(p: any): number {
    return parseFloat(p.price || p.Price || '99999') || 99999;
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
    return this.products.filter(p => this.isIntel(p) && this.getPrice(p) < 99999)
      .sort((a, b) => this.getPrice(a) - this.getPrice(b))[0] || null;
  }

  private getCheapestAmd(): any {
    return this.products.filter(p => this.isAmd(p) && this.getPrice(p) < 99999)
      .sort((a, b) => this.getPrice(a) - this.getPrice(b))[0] || null;
  }

  private getBestValuePerCore(): any {
    return this.products
      .filter(p => this.getPrice(p) < 99999 && (p.cores || p.Cores))
      .map(p => ({
        server: p,
        ppc: this.getPrice(p) / (parseInt(p.cores || p.Cores || '1') || 1)
      }))
      .sort((a, b) => a.ppc - b.ppc)[0]?.server || null;
  }

  getTopThreeDedicated(): any[] {
    const result: { server: any; type: 'intel' | 'amd' | 'value' | 'fallback' }[] = [];
    const intel = this.getCheapestIntel();
    const amd = this.getCheapestAmd();
    const value = this.getBestValuePerCore();

    if (intel) result.push({ server: intel, type: 'intel' });
    if (amd) result.push({ server: amd, type: 'amd' });
    if (value && !result.some(r => r.server.id === value.id)) {
      result.push({ server: value, type: 'value' });
    }

    const seenIds = new Set(result.map(r => r.server.id));
    const remaining = this.products
      .filter(p => !seenIds.has(p.id) && this.getPrice(p) < 99999)
      .sort((a, b) => this.getPrice(a) - this.getPrice(b));

    while (result.length < 3 && remaining.length > 0) {
      result.push({ server: remaining.shift()!, type: 'fallback' });
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

  // TrackBy functions
  trackByFn = (index: number, item: any) => item?.id || index;
  trackByTopThree = (index: number, item: any) => item?.server?.id || index;

  orderNow(id: number): void {
    this.http.get(API_ENDPOINTS.DEDICATED.ORDER_WHATSAPP(id.toString()), { responseType: 'text' as 'json' })
      .subscribe({
        next: (res: any) => {
          const link = typeof res === 'string' ? res : (res?.link || res?.url || '');
          window.open(link || `https://wa.me/+201063194547?text=I'm interested in Dedicated Server #${id}`, '_blank');
        },
        error: () => {
          window.open(`https://wa.me/+201063194547?text=I'm interested in Dedicated Server #${id}`, '_blank');
        }
      });
  }
}
